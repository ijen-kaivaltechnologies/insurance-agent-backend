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
module.exports = {
	getRelativePath,
};
