
module.exports = function(track){
  if (typeof track !== 'string') {
    return null;
  }

  return track
    // Case is insensitive
    .toLowerCase()
    // Replace all white spaces by a single space
    .replace(/\s+|(^\s*,\s*)|(\s*,\s*$)/g, ' ')
    // Remove multiple following commas
    .replace(/(, ?)+/g, ',')
    // Remove superfluous spaces and commas
    .replace(/(?:^ ?,? ?)|(?: ?,? ?$)|(?: ?(,) ?)/g, '$1')
    // Split into phrases
    .split(',')
    // Normalize each phrase
    .map(function(phrase){
      return phrase
        // Split phrase into keywords
        .split(' ')
        // Sort keywords alphabetically
        .sort()
        // Rebuild phrase
        .join(' ');
    })
    // Sort phrases alphabetically
    .sort()
    // Rebuild track
    .join(',')
    // If the query is not valid, force to return null
    || null;
};
