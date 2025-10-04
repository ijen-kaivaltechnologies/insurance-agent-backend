const { parse } = require("csv-parse");
const XLSX = require("xlsx");
const fs = require("fs");
const env = require("../config/env");

/**
 * Get relative path from absolute path
 * @param {string} absolutePath - Absolute file path
 * @returns {string} - Relative file path
 */
const getRelativePath = (absolutePath) => {
	if (!absolutePath) return null;
	// Convert backslashes to forward slashes for consistency
	const normalizedPath = absolutePath.replace(/\\/g, "/");
	// Extract the path relative to the uploads directory
	const uploadsDirIndex = normalizedPath.indexOf("/" + env.uploadsDir + "/");
	if (uploadsDirIndex !== -1) {
		return normalizedPath.substring(uploadsDirIndex + 1); // +1 to remove the leading slash
	}
	return normalizedPath;
};

/**
 * Cleans a value based on its type.
 *
 * - If the value is a string:
 *   - Trims whitespace.
 *   - Returns `null` if the string is "NULL", "NA", "na", "n/a" (case-insensitive) or empty.
 *   - Parses it to a number if it represents a numeric value.
 * - If the value is already a number, it is returned as-is.
 * - If the value is `null` or `undefined`, returns `null`.
 *
 * @param {any} value - The input value to clean.
 * @returns {string|number|null} - The cleaned value.
 */
function cleanValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (["NULL", "NA", "na", "n/a"].includes(trimmed.toUpperCase()) || trimmed === "") {
      return null;
    }

    const numberValue = Number(trimmed);
    if (!isNaN(numberValue)) {
      return numberValue;
    }

    return trimmed;
  }

  if (typeof value === 'number') {
    return value;
  }

  return value;
}

/**
 * Parse uploaded file (CSV or Excel) and return rows as JSON
 * @param {string} filePath - Path to the uploaded file
 * @returns {Promise<Array<Object>>} - Promise resolving to array of rows
 */
async function parseInputFile(filePath) {
	if (!fs.existsSync(filePath)) {
		throw new Error("File not found");
	}

	const fileExt = filePath.split(".").pop().toLowerCase();

	if (fileExt === "csv") {
		// Parse CSV
		const fileContent = fs.readFileSync(filePath, "utf-8");

		return await new Promise((resolve, reject) => {
			parse(
				fileContent,
				{
					columns: true,
					skip_empty_lines: true,
					trim: true,
					cast: true,
					comment: "#",
				},
				(err, data) => {
					if (err) reject(err);
					else resolve(data);
				}
			);
		});
	} else if (fileExt === "xlsx" || fileExt === "xls") {
		// Parse Excel
		const workbook = XLSX.readFile(filePath);
		const sheetName = workbook.SheetNames[0]; // First sheet
		const worksheet = workbook.Sheets[sheetName];

		// Convert sheet to JSON
		return XLSX.utils.sheet_to_json(worksheet, { defval: null });
	} else {
		throw new Error("Unsupported file type");
	}
}

module.exports = {
	getRelativePath,
	cleanValue,
	parseInputFile,
};