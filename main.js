// Draws the Menu module's Tiles onto the page. The rules live in menu.js.
import { games } from "./games.js";
import { menu } from "./menu.js";

const list = document.getElementById("tiles");

try {
  menu(games).forEach((tile) => list.appendChild(renderTile(tile)));
} catch (error) {
  const message = document.createElement("li");
  message.className = "menu-error";
  message.textContent = "The Games list has a mistake: " + error.message;
  list.appendChild(message);
}

function renderTile(tile) {
  const item = document.createElement("li");

  // Only Ready and Test Tiles are links; a Coming-soon Tile is a plain box
  // with nothing to tap.
  const box = document.createElement(tile.href ? "a" : "div");
  box.className = "tile tile-" + tile.state;
  if (tile.href) box.href = tile.href;
  if (tile.state === "coming-soon") box.setAttribute("aria-disabled", "true");

  const art = document.createElement("div");
  art.className = "tile-art";
  const icon = document.createElement("img");
  icon.src = tile.icon;
  icon.alt = "";
  // A missing icon leaves the plain background and the name below it.
  icon.addEventListener("error", () => icon.remove());
  art.appendChild(icon);
  box.appendChild(art);

  const name = document.createElement("span");
  name.className = "tile-name";
  name.textContent = tile.name;
  box.appendChild(name);

  if (tile.state === "test") box.appendChild(badge("TEST"));
  if (tile.state === "coming-soon") box.appendChild(badge("Coming soon"));

  item.appendChild(box);
  return item;
}

function badge(text) {
  const element = document.createElement("span");
  element.className = "tile-badge";
  element.textContent = text;
  return element;
}
