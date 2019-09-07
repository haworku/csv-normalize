# Normalize CSV
 A tool that reads a CSV formatted file on stdin and emits a normalized CSV formatted file on stdout. 

## Usage

- `npm install` to add js dependencies 
-  `node normalizer.js < sample1.csv > output.csv`

## Assumptions

Normalized, in this case, means:

- [ ] Uses UTF-8 character set. 
- [ ] If there are invalid UTF-8 characters, replace them with the Unicode Replacement Character.
- [ ] If that replacement makes data invalid, print a warning to stderr and drop the row from output.
- [X] Timestamp in ISO-8601 format
- [X] Timestamp is in US/Pacific time, convert to US/Eastern.
- [x] If date is invalid, print warning to stderr and drop row
- [x] Zip codes formatted as 5 digits. If less than 5 digits, assume 0 as the prefix.
- [x] Names converted to uppercase. 
- [X] Duration columns displayed in seconds.