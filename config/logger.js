import chalk from 'chalk';
import boxen from 'boxen';
import { getConfig, getHelper } from '../index.js';
const getTimestamp = () => {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
};
const logger = {
    init: () => {
        const credits = boxen(
            `${chalk.green.bold("Version        :")} 1.2\n` +
            `${chalk.green.bold("Donate         :")} https://bit.ly/ev99xs\n` +
            `${chalk.green.bold("Discord        :")} https://bit.ly/evbots\n` +
            `${chalk.green.bold("Using Proxy    :")} ${getConfig.proxySettings.enableProxy}\n` +
            `${chalk.green.bold("Facebook Bots  :")} false\n` +
            `${chalk.green.bold("Developed by   :")} NelFeast & xAnet`
        , {
            width: 50,
            padding: .7,
            title: "EVOBOTS",
            borderStyle: "bold",
            titleAlignment: 'center',
            borderColor: "greenBright",
        });
        console.log(credits);
        getHelper.wn4l(getConfig.botName);
    },
    info: (message) => {
        console.log(`${chalk.green('[EVOBOTS]')} ${chalk.gray(getTimestamp())} - ${message}`);
    },
    warn: (message) => {
        console.log(`${chalk.yellow('[EVOBOTS]')} ${chalk.gray(getTimestamp())} - ${message}`);
    },
    error: (message) => {
        console.log(`${chalk.red('[EVOBOTS]')} ${chalk.gray(getTimestamp())} - ${chalk.red(message)}`);
    }
};
export default logger;
