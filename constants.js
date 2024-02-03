// randomly generated 32 numbers
export const KEY =  Buffer.from('28480740518340364334720032037592', 'hex');

export const REPLY_WITH_ENCRYPTED_RANDOM_KEY = '100201';
export const AUTHENTICATION_SUCCESSFUL = '100301';
export const REQUEST_RANDOM_KEY = '100101';
export const SENDING_KEY_FAILURE = '100104';
export const ENCRYPTION_KEY_FAILURE = '100304';

export const AUTH_SERVICE_CHARACTERISTIC_UUID = '000000090000351221180009af100700';
export const BATTERY_CHARACTERISTIC_UUID = '000000060000351221180009af100700';
export const STEPS_CHARACTERISTIC_UUID = '000000070000351221180009af100700';
export const CONFIGURATION_CHARACTERISTIC_UUID = '000000030000351221180009af100700'
export const CURRENT_TIME_CHARACTERISTIC_UUID = '2a2b'
export const ALERT_CHARACTERISTIC_UUID = '2a06';
export const SOFTWARE_REVISION_CHARACTERISTIC_UUID = '2a28';
export const HARDWARE_REVISION_CHARACTERISTIC_UUID = '2a27';
export const SERIAL_NUMBER_UUID = '2a25';

export const ALERT_TYPE = {
    MESSAGE: 0x01,
    PHONE: 0x02,
    VIBRATE: 0x03,
}

export const MENU_CHOICES = {
  GET_GENERAL_INFO: 'Get general info',
  GET_BATTERY_INFO: 'Get battery info',
  GET_STEPS_INFO: 'Get steps info',
  GET_CURRENT_TIME: 'Get current time',
  CHANGE_CURRENT_TIME: 'Change current time',
  SET_TO_CURRENT_DATE: 'Reset current time',
  MAKE_BAND_VIBRATE: 'Make band vibrate',
  SEND_CALL_NOTIFICATION: 'Send call notification',
  SEND_MESSAGE_NOTIFICATION: 'Send message notification',
  EXIT: 'Exit',
}

export const MENU_OPTIONS = [
  {
    type: 'select',
    name: 'choice',
    message: 'Select an option:',
    choices: [
      MENU_CHOICES.GET_GENERAL_INFO,
      MENU_CHOICES.GET_BATTERY_INFO,
      MENU_CHOICES.GET_STEPS_INFO,
      MENU_CHOICES.GET_CURRENT_TIME,
      MENU_CHOICES.CHANGE_CURRENT_TIME,
      MENU_CHOICES.SET_TO_CURRENT_DATE,
      MENU_CHOICES.MAKE_BAND_VIBRATE,
      MENU_CHOICES.SEND_CALL_NOTIFICATION,
      MENU_CHOICES.SEND_MESSAGE_NOTIFICATION,
      MENU_CHOICES.EXIT
    ],
  },
]

export const MONTH = {
  0x01: 'January',
  0x02: 'February',
  0x03: 'March',
  0x04: 'April',
  0x05: 'May',
  0x06: 'June',
  0x07: 'July',
  0x08: 'August',
  0x09: 'September',
  0xa: 'October',
  0xb: 'November',
  0xc: 'December',
}

export const DAY_IN_WEEK = {
  0x01: 'Monday',
  0x02: 'Tuesday',
  0x03: 'Wednesday',
  0x04: 'Thursday',
  0x05: 'Friday',
  0x06: 'Saturday',
  0x07: 'Sunday',
}

