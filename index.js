import enquirer from "enquirer";
import chalk from "chalk";
import { Band } from "./band.js"
import { sleep } from "./helpers.js"
import { MENU_CHOICES, MENU_OPTIONS } from "./constants.js"

const MAC = 'D7:47:22:D6:EE:91'

const showMenu = async (band) => {
  try {
    const answers = await enquirer.prompt(MENU_OPTIONS); 
    switch (answers.choice) {
      case MENU_CHOICES.GET_GENERAL_INFO:
        const {SOFTWARE_REVISION, HARDWARE_REVISION, SERIAL_NUMBER} = await band.getGeneralInfo();
        console.log(`${chalk.red('Software revision')}: ${chalk.yellow(SOFTWARE_REVISION)}`);
        console.log(`${chalk.red('Hardware revision')}: ${chalk.yellow(HARDWARE_REVISION)}`);
        console.log(`${chalk.red('Serial number')}: ${chalk.yellow(SERIAL_NUMBER)}`);
        break;
      case MENU_CHOICES.GET_BATTERY_INFO:
        const { STATUS, LEVEL, LAST_LEVEL } = await band.getBatteryInfo();
        console.log(`${chalk.red('Battery status')}: ${chalk.yellow(STATUS)}`);
        console.log(`${chalk.red('Battery level')}: ${chalk.yellow(`${LEVEL}%`)}`);
        console.log(`${chalk.red('Last battery level')}: ${chalk.yellow(`${LAST_LEVEL}%`)}`);
        break;
      case MENU_CHOICES.GET_STEPS_INFO:
        const { STEPS, METERS, CALORIES } = await band.getStepsInfo();
        console.log(`${chalk.red('Steps')}: ${chalk.yellow(STEPS)}`);
        console.log(`${chalk.red('Meters')}: ${chalk.yellow(`${METERS}m`)}`);
        console.log(`${chalk.red('Calories')}: ${chalk.yellow(`${CALORIES}kcal`)}`);
        break;
      case MENU_CHOICES.GET_CURRENT_TIME:
        const { DAY, MONTH, DAY_IN_WEEK, TIME, YEAR } = await band.getCurrentTime();
        console.log(`${chalk.red('Day')}: ${chalk.yellow(DAY)}`);
        console.log(`${chalk.red('Month')}: ${chalk.yellow(MONTH)}`);
        console.log(`${chalk.red('Year')}: ${chalk.yellow(YEAR)}`);
        console.log(`${chalk.red('Day in week')}: ${chalk.yellow(DAY_IN_WEEK)}`);
        console.log(`${chalk.red('Time')}: ${chalk.yellow(TIME)}`);
        break;
      case MENU_CHOICES.SET_TO_CURRENT_DATE:
        await band.resetCurrentDate();
        break;
      case MENU_CHOICES.CHANGE_CURRENT_TIME:
        await band.changeDateToSomethingInThePast();
        break;
      case MENU_CHOICES.MAKE_BAND_VIBRATE:
        await band.vibrate();
        break;
      case MENU_CHOICES.SEND_CALL_NOTIFICATION:
        await band.sendMissedCall();
        break;
      case MENU_CHOICES.SEND_MESSAGE_NOTIFICATION:
        await band.sendMessage();
        break;
      case MENU_CHOICES.EXIT:
        console.log('Exiting...');
        await band.disconnect();
        process.exit();
      default:
        console.log('Invalid choice');
    }
  
    showMenu(band);

  } catch (error) {
    console.log(error);
  }
}

const main = async () => {
    const band = await Band.findDevice(MAC)

    // connect to band
    await band.connect();
    
    // authenticate with band
    await band.authenticate();

    // settle for 2000 milis
    await sleep(2000);

    // clear console
    console.clear();

    // show menu options
    showMenu(band);
}

main();
