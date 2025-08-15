const SplunkLogger = require("winston-splunk-httplogger");

const splunkConfig = {
  token: process.env.SPLUNK_HEC_TOKEN,
  url: process.env.SPLUNK_HEC_URL,
  index: process.env.SPLUNK_INDEX || "main"
};

const splunkLogger = new SplunkLogger(splunkConfig);

module.exports = splunkLogger;
