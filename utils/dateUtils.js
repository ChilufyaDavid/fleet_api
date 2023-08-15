
function convertDateFormat(dateTimeString) {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('.');
    return `${year}-${month}-${day}` // `${month}${day}.${year}`;
}

function mySqlDateFormat(dateTimeString) {
    const [day, month, year] = dateTimeString.split('.');
    return `${year}-${month}-${day}`;
}

function timeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  
function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
}

function getWeekNumber(date) {
  const startDate = new Date(date.getFullYear(), 0, 1); // January 1st of the same year
  const daysPassed = Math.floor((date - startDate) / (24 * 60 * 60 * 1000)) + 1;
  const weekNumber = Math.ceil(daysPassed / 7);
  return weekNumber;
}

module.exports = {
    convertDateFormat,
    mySqlDateFormat,
    timeToSeconds,
    secondsToTime,
    timeToMinutes,
    minutesToTime,
    getWeekNumber
}