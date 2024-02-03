import { MONTH, DAY_IN_WEEK } from './constants.js'

export const parseBatteryInfo = (batteryData) => {
    return {
        STATUS: batteryData.readInt8(2) === 0 ? 'Not charging' : 'Charging',
        LEVEL:  batteryData.length >= 2 ? batteryData.readInt8(1) : null,
        LAST_LEVEL: batteryData.length >= 20 ? batteryData.readInt8(19) : null,
    }
}

export const parseStepsInfo = (stepsData) => {
    return {
        STEPS: stepsData.length >= 3 ? stepsData.readUInt16LE(1) : null,
        METERS: stepsData.length >= 7 ? stepsData.readUInt16LE(5) : null,
        CALORIES: stepsData.length >= 10 ? stepsData.readInt8(9) : null
    }
}

export const parseCurrentTimeInfo = (currentTimeData) => {
    return {
        DAY: currentTimeData.length >= 4 ? currentTimeData.readInt8(3) : null,
        MONTH: currentTimeData.length >= 3 ? MONTH[currentTimeData.readInt8(2)] : null,
        YEAR: getCurrentYear(currentTimeData),
        DAY_IN_WEEK: currentTimeData.length >= 8 ? DAY_IN_WEEK[currentTimeData.readInt8(7)] : null,
        TIME: getCurrentTime(currentTimeData),
    }
}

const getCurrentTime = (timeData) => {
    const hours = timeData.length >= 5 ? timeData.readInt8(4) : null;
    const minutes = timeData.length >= 6 ? timeData.readInt8(5) : null;
    const seconds = timeData.length >=7 ? timeData.readInt8(6) : null;

    return `${hours}:${minutes}:${seconds}`;
}

const getCurrentYear = (timeData) => {
    const firstYearParameter = timeData.length >= 1 ? timeData.readUInt8(0) : null;
    const secondYearParameter = timeData.length >= 2 ? timeData.readInt8(1) : null;

    if (firstYearParameter === null || secondYearParameter === null) {
        return null;
    }

    const yearCandidates = [];
    for (let iter = 1000; iter < 4000; iter++) {
        if (iter % 256 == firstYearParameter) {
            yearCandidates.push(iter);
        }
    }
    
    const foundYear = yearCandidates.find((year) => Math.floor(year/256) == secondYearParameter);

    return foundYear ? foundYear : null;
}

const toInt8 = (decimalValue) => {
    // Ensure the value is within the int8 range [-128, 127]
    const clampedValue = Math.max(-128, Math.min(127, decimalValue));
    
    // Use bitwise AND with 0xFF to get the equivalent int8 value
    const int8Value = clampedValue & 0xFF;
  
    return int8Value;
  }
  
// Convert to uint8
const toUint8 = (decimalValue) => {
    // Ensure the value is within the uint8 range [0, 255]
    const clampedValue = Math.max(0, Math.min(255, decimalValue));
    
    // Use bitwise AND with 0xFF to get the equivalent uint8 value
    const uint8Value = clampedValue & 0xFF;
  
    return uint8Value;
  }

export const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const day = currentDate.getDay();

    return [toUint8(year%256), toInt8(Math.floor(year/256)), toInt8(month), toInt8(date), toInt8(hours), toInt8(minutes), toInt8(seconds), toInt8(day === 0 ? 7 : day), 0x00,0x00,0x16]
}

export const sleep = async (miliseconds) => {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}