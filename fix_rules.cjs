const fs = require('fs');
let code = fs.readFileSync('firestore.rules.test.ts', 'utf8');

// Replace testEnv.firestore.FieldValue.serverTimestamp() with null or mock since we are testing rules
// Rules check timestamp, but in v9 modular we import it.
code = "import { serverTimestamp } from 'firebase/firestore';\n" + code;
code = code.replace(/testEnv\.firestore\.FieldValue\.serverTimestamp\(\)/g, 'serverTimestamp()');

fs.writeFileSync('firestore.rules.test.ts', code);
