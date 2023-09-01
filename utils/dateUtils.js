
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

function compareDateStrings(dateString1, dateString2) {
  const [year1, month1, day1] = dateString1.split('-');
  const [year2, month2, day2] = dateString2.split('-');

  const date1 = new Date(parseInt(year1), parseInt(month1 - 1), parseInt(day1)); // Month is 0-based in Date object
  const date2 = new Date(parseInt(year2), parseInt(month2 - 1), parseInt(day2));
  if (date1 < date2) {
    return false; // dateString1 is before dateString2
  } else if (date1 > date2) {
    return false;  // dateString1 is after dateString2
  } else {
    return true;  // dateString1 is equal to dateString2
  }
}

module.exports = {
    convertDateFormat,
    mySqlDateFormat,
    timeToSeconds,
    secondsToTime,
    timeToMinutes,
    minutesToTime,
    getWeekNumber,
    compareDateStrings
}