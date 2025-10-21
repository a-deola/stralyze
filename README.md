# Strings API

A RESTful API for analyzing strings and storing their computed properties.

---

## Features

For each analyzed string, the API computes and stores:

- **length**: Number of characters  
- **is_palindrome**: Whether the string reads the same forwards and backwards
- **unique_characters**: Number of distinct characters  
- **word_count**: Number of words  
- **sha256_hash**: SHA-256 hash of the string 
- **character_frequency_map**: Counts of each character  

The API also supports filtering and natural language queries.

---

## Endpoints

### 1. Create String
**POST** `/strings`  
**Body:**
```json
{
  "value": "your string here"
}
```
## 2. Get Specific String

**GET** `/strings/{string_value}`

**Responses:**

- `200 OK` - Returns the analyzed string object  
- `404 Not Found` - String not in the system  

---

## 3. Get All Strings (with filters)

**GET** `/strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a`

**Query Parameters:**

- `is_palindrome` (boolean)  
- `min_length` / `max_length` (integer)  
- `word_count` (integer)  
- `contains_character` (single character)  

**Responses:**

- `200 OK` - Array of matching strings  
- `400 Bad Request` - Invalid query parameter  

---

## 4. Natural Language Filtering

**GET** `/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`

**Supported example queries:**

- `"all single word palindromic strings"` → `word_count=1, is_palindrome=true`  
- `"strings longer than 10 characters"` → `min_length=11`  
- `"palindromic strings that contain the first vowel"` → `is_palindrome=true, contains_character=a`  
- `"strings containing the letter z"` → `contains_character=z`  

**Responses:**

- `200 OK` – Matching strings with parsed filters  
- `400 Bad Request` – Cannot parse query  
- `422 Unprocessable Entity` – Conflicting filters  

---

## 5. Delete String

**DELETE** `/strings/{string_value}`

**Responses:**

- `204 No Content` – Successfully deleted  
- `404 Not Found` – String does not exist  

---

## Installation & Running

1. **Clone the repo:**
```bash
git clone https://github.com/a-deola/stralyze.git
cd stralyze
```

2. **Build the project:**
```bash
npm run build
```

3. **Start the server:**
```bash
npm run start
# or for production
npm run start:prod
```

The server runs on port 3000 by default.
