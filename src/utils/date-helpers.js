function validateDate(dateString) {
  if (!dateString) {
    throw new Error("Date is required");
  }

  if (dateString.toLowerCase() === "today") {
    return formatDate(new Date());
  }
  if (dateString.toLowerCase() === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }

  // Parse DD-MM-YYYY format
  const parts = dateString.split("-");
  let date;

  if (parts.length === 3) {
    // Assuming DD-MM-YYYY format
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    date = new Date(year, month, day);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) {
    throw new Error(
      `Invalid date format: ${dateString}. Use DD-MM-YYYY format.`
    );
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    throw new Error("Date cannot be in the future");
  }

  return formatDate(date);
}

function formatDate(date) {
  if (!date) {
    date = new Date();
  }

  if (typeof date === "string") {
    date = new Date(date);
  }

  // Format as DD-MM-YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

module.exports = {
  validateDate,
  formatDate,
};
