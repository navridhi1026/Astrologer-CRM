/**
 * Export an array of client objects to a downloadable CSV file.
 * @param {array} clients
 */
export function exportClientsCSV(clients) {
  const headers = [
    'Name', 'Email', 'Phone', 'Date of Birth',
    'Zodiac Sign', 'Suggested Gemstone', 'Address', 'Notes',
  ];

  const escape = (val) => {
    if (val == null) return '';
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str}"`
      : str;
  };

  const rows = clients.map((c) => [
    escape(c.name),
    escape(c.email),
    escape(c.phone),
    escape(c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString('en-IN') : ''),
    escape(c.zodiacSign),
    escape(c.suggestedGemstone),
    escape(c.address),
    escape(c.notes),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `clients_export_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
