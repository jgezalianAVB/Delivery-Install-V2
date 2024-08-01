//import { createRequire } from "module";
//const require = createRequire(import.meta.url);
const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const jsonfile = require("jsonfile");
var cron = require("node-cron");
const express = require("express");
var cors = require("cors");
const app = express();
app.use(cors());

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`delivery_install_calc_server: listening on port ${port}`);
});

//app.get("/", (req, res) => {});

app.get("/", (req, res) => {
  res.send("");
});

app.get("/delivery_install", (req, res) => {
  authorize().then((client) => {
    getSheetData(client, "delivery_install").then((data) => {
      res.send(data);
    });
  });
});

app.get("/four_piece_kitchen", (req, res) => {
  authorize().then((client) => {
    getSheetData(client, "four_piece_kitchen").then((data) => {
      res.send(data);
    });
  });
});

app.get("/laundry_delivery_install", (req, res) => {
  authorize().then((client) => {
    getSheetData(client, "laundry_delivery_install").then((data) => {
      res.send(data);
    });
  });
});

app.get("/laundry_calc", (req, res) => {
  authorize().then((client) => {
    getSheetData(client, "laundry_calc").then((data) => {
      res.send(data);
    });
  });
});

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    //added this
    Promise.resolve(client);
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

//authorize().then(getSheetData).catch(console.error);

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

async function getSheetData(auth, service) {
  const sheets = google.sheets({ version: "v4", auth });

  if (service == "delivery_install") {
    const delivery_install_req = await sheets.spreadsheets.values.get({
      spreadsheetId: "id_here",
      range: "delivery_install!B12:J20",
    });

    const delivery_install_data = delivery_install_req.data.values;
    if (!delivery_install_data || delivery_install_data.length === 0) {
      console.log("No data found delivery.");
      return;
    }
    let delivery_install_arr = [];
    delivery_install_data.forEach((row) => {
      delivery_install_arr.push({
        service: row[0].trim(),
        best_buy_price: row[1].trim(),
        home_depot_price: row[2].trim(),
        lowes_price: row[3].trim(),
      });
    });
    return delivery_install_arr;
  }

  if (service == "four_piece_kitchen") {
    const four_piece_kitchen_req = await sheets.spreadsheets.values.get({
      spreadsheetId: "id_here",
      range: "delivery_install!B22:J28",
    });

    const four_piece_kitchen_data = four_piece_kitchen_req.data.values;
    if (!four_piece_kitchen_data || four_piece_kitchen_data.length === 0) {
      console.log("No data found.");
      return;
    }
    let four_piece_kitchen_arr = [];
    four_piece_kitchen_data.forEach((row) => {
      four_piece_kitchen_arr.push({
        service: row[0].trim(),
        best_buy_price: row[1].trim(),
        home_depot_price: row[2].trim(),
        lowes_price: row[3].trim(),

      });
    });
    return four_piece_kitchen_arr;
  }

  if (service == "laundry_delivery_install") {
    const laundry_req = await sheets.spreadsheets.values.get({
      spreadsheetId: "id_here",
      range: "delivery_install!B36:J43",
    });

    const laundry_data = laundry_req.data.values;
    if (!laundry_data || laundry_data.length === 0) {
      console.log("No data found.");
      return;
    }

    let laundry_arr = [];
    laundry_data.forEach((row) => {
      laundry_arr.push({
        service: row[0].trim(),
        best_buy_price: row[1].trim(),
        home_depot_price: row[2].trim(),
        lowes_price: row[3].trim(),
      });
    });
    return laundry_arr;
  }

  if (service == "laundry_calc") {
    const laundry_req = await sheets.spreadsheets.values.get({
      spreadsheetId: "id_here",
      range: "delivery_install!B46:J50",
    });

    const laundry_data = laundry_req.data.values;
    if (!laundry_data || laundry_data.length === 0) {
      console.log("No data found.");
      return;
    }

    let laundry_arr = [];
    laundry_data.forEach((row) => {
      laundry_arr.push({
        service: row[0].trim(),
        best_buy_price: row[1].trim(),
        home_depot_price: row[2].trim(),
        lowes_price: row[3].trim(),
      });
    });
    return laundry_arr;
  }
}
