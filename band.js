'use strict'
import noble from "@abandonware/noble"
import crypto from "crypto"
import { AUTHENTICATION_SUCCESSFUL, KEY, REPLY_WITH_ENCRYPTED_RANDOM_KEY, REQUEST_RANDOM_KEY, AUTH_SERVICE_CHARACTERISTIC_UUID, SOFTWARE_REVISION_CHARACTERISTIC_UUID, HARDWARE_REVISION_CHARACTERISTIC_UUID, SERIAL_NUMBER_UUID, BATTERY_CHARACTERISTIC_UUID, ALERT_TYPE, ALERT_CHARACTERISTIC_UUID, SENDING_KEY_FAILURE, ENCRYPTION_KEY_FAILURE, STEPS_CHARACTERISTIC_UUID, CONFIGURATION_CHARACTERISTIC_UUID, CURRENT_TIME_CHARACTERISTIC_UUID} from './constants.js'
import { getCurrentDate, parseBatteryInfo, parseCurrentTimeInfo, parseStepsInfo } from "./helpers.js";

const END = -1;

class Band {
  static async findDevice (address, timeout = 30000) {
    return new Promise((res) => {
      timeout = setTimeout(() => {
        noble.stopScanning()
        throw new Error('[Searching...] Timeout reached')
      }, timeout)
      const onDiscover = (peripheral) => {
        console.log('[Searching...] Device found', peripheral.address)
        if (peripheral.address === address.toLowerCase()) {
          clearTimeout(timeout)
          noble.stopScanning()
          noble.removeListener('discover', onDiscover)
          res(new this(peripheral))
        }
      }
      noble.on('discover', onDiscover)
      noble.startScanning()
    })
  }

  constructor (device) {
    this.device = device
  }

  async connect () {
    await this.device.connectAsync()
    console.log('[MiBand] Connected');
    await this.initializeServicesAndCharacteristics();
    console.log('[MiBand] Initialized');
    return this
  }

  async disconnect() {
    await this.device.disconnectAsync()
    console.log('[MiBand] Disconnected');
  }
  

  async initializeServicesAndCharacteristics() {
    const servicesAndCharacteristics = await this.device.discoverAllServicesAndCharacteristicsAsync();
    this.services = [...servicesAndCharacteristics.services];
    this.characteristics = [...servicesAndCharacteristics.characteristics];
    return this;
  }

  getCharacteristic(characteristicUuid) {
    const foundCharacteristic = this.characteristics.find((characteristic) => {
      return characteristic.uuid === characteristicUuid;
    });
    if (!foundCharacteristic) {
      throw new Error("Characteristic with given UUID does not exist");
    }
    return foundCharacteristic;
  }

  write (characteristicUuid, ...value) {
    const data = Buffer.concat(value.map(v => v instanceof Buffer ? v : Buffer.from(v)))
    const char = this.getCharacteristic(characteristicUuid)
    return char.writeAsync(data, char.properties.includes('writeWithoutResponse'))
  }

  writeAndListen (characteristicUuid, writeData, callback, maxDelay = 2000) {
    return new Promise(async (resolve) => {
      let timeout
      const char = this.getCharacteristic(characteristicUuid)
      const onData = (data) => {
        if (timeout) {
          clearTimeout(timeout)
        }
        let reply = callback(data)
        if (reply) {
          if (reply === END) {
            char.removeListener('data', onData)
            return resolve()
          }
          if (typeof reply[0] !== 'object') {
            reply = [reply]
          }
          this.write.call(this, characteristicUuid, ...reply)
        }
        timeout = setTimeout(() => resolve, maxDelay)
      }
      await char.subscribeAsync()
      char.on('data', onData)
      if (writeData) {
        if (typeof writeData[0] !== 'object') {
          writeData = [writeData]
        }
        await this.write(characteristicUuid, ...writeData)
      }
    })
  }

  async authenticate () {
    await this.writeAndListen(AUTH_SERVICE_CHARACTERISTIC_UUID, [0x01, 0x00], (data) => {
      const cmd = data.toString('hex', 0, 3)
      if (cmd === SENDING_KEY_FAILURE) {
        return [0x02, 0x08]
      } else if (cmd === REQUEST_RANDOM_KEY) {
        return [0x02, 0x08]
      } else if(cmd === REPLY_WITH_ENCRYPTED_RANDOM_KEY) {
        const randomNumber = data.slice(3)
        const encrypted = crypto.createCipheriv('aes-128-ecb', KEY, null).update(randomNumber)
        return [[0x03, 0x08], encrypted]
      } else if(cmd === AUTHENTICATION_SUCCESSFUL) {
        console.log('[MiBand] Authenticated')
        return END
      } else if(cmd === ENCRYPTION_KEY_FAILURE) {
        // key failure
        return [[0x01, 0x08], KEY]
      } else {
        console.error('[Auth] received:', data)
        throw new Error('[Auth] unknown response')
      }
    })
    return this
  }

  async readFromCharacteristic(characteristicUuid) {
    return await this.getCharacteristic(characteristicUuid).readAsync()
  }

  async getSoftwareRevision () {
    return (await this.readFromCharacteristic(SOFTWARE_REVISION_CHARACTERISTIC_UUID)).toString();
  }

  async getHardwareRevision() {
    return (await this.readFromCharacteristic(HARDWARE_REVISION_CHARACTERISTIC_UUID)).toString();
  }

  async getSerialNumber() {
    return (await this.readFromCharacteristic(SERIAL_NUMBER_UUID)).toString();
  }

  async getGeneralInfo() {
    return {
      SOFTWARE_REVISION: await this.getSoftwareRevision(),
      HARDWARE_REVISION: await this.getHardwareRevision(),
      SERIAL_NUMBER: await this.getSerialNumber()
    }
  }

  async getBatteryInfo() {
    const batteryData = await this.readFromCharacteristic(BATTERY_CHARACTERISTIC_UUID);
    return parseBatteryInfo(batteryData);
  }

  async getStepsInfo() {
    const stepsData = await this.readFromCharacteristic(STEPS_CHARACTERISTIC_UUID);
    return parseStepsInfo(stepsData);
  }

  async getCurrentTime() {
    const timeData = await this.readFromCharacteristic(CURRENT_TIME_CHARACTERISTIC_UUID);
    return parseCurrentTimeInfo(timeData);
  }

  async changeDateToSomethingInThePast() {
    await this.write(CURRENT_TIME_CHARACTERISTIC_UUID, [0xd0,0x07,0xc,0x07,0x00,0x00,0x00,0x04,0x00,0x00,0x16])
  }

  async resetCurrentDate() {
    await this.write(CURRENT_TIME_CHARACTERISTIC_UUID, getCurrentDate())
  }

  async sendMissedCall () {
    await this.write(ALERT_CHARACTERISTIC_UUID, [ALERT_TYPE.PHONE]);
  }

  async sendMessage () {
    await this.write(ALERT_CHARACTERISTIC_UUID, [ALERT_TYPE.MESSAGE]);
  }

  async vibrate() {
    await this.write(ALERT_CHARACTERISTIC_UUID, [ALERT_TYPE.VIBRATE]);
  }
}

export { Band }