import fetch from "node-fetch";

async function run() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/nonexistent", {
      method: "POST"
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}
run();
