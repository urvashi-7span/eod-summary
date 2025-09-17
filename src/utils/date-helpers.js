function validateDate(dateString) {
  if (!dateString) {
    throw new Error('Date is required');
  }

  if (dateString.toLowerCase() === 'today') {
    return formatDate(new Date());
  }
  if (dateString.toLowerCase() === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD format.`);
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (date > today) {
    throw new Error('Date cannot be in the future');
  }

  return formatDate(date);
}

function formatDate(date) {
  if (!date) {
    date = new Date();
  }
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toISOString().split('T')[0];
}

module.exports = {
  validateDate,
  formatDate
};
