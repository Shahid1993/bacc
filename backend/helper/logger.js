const sendMail = require('sendmail')({silent: true});
const schedule = require('node-schedule');
const winston = require('winston');

winston.setLevels({
  debug: 0,
  info: 1,
  silly: 2,
  warn: 3,
  error: 4,
});

winston.addColors({
  debug: 'green',
  info: 'cyan',
  silly: 'magenta',
  warn: 'yellow',
  error: 'red'
});

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: 'error',
  colorize: true,
  prettyPrint: true
});

winston.add(winston.transports.File, {
  level: 'error',
  filename: 'bacc.log',
  maxsize: 7340032, //7MB
  maxFiles: 1,
  colorize: true,
  prettyPrint: true
});

/*

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

*/

if (process.env.BACC) {

  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
  rule.hour = 10;
  rule.minute = 0;

  schedule.scheduleJob(rule, () => {
    sendMail({
      from: 'no-reply@bacc.com',
      to: 'lars.voigt@dzb.de',
      subject: 'bacc.log',
      html: '',
      attachments: [
        {   // define custom content type for the attachment
          filename: 'bacc.log',
          path: './bacc.log' // stream this file
        }
      ]
    }, (err, reply) => {
      winston.log('error', err && err.stack);
    });
  });
}

module.exports = winston;
