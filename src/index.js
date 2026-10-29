import content from "./content/wizard.json";

// Parcel only bundles assets referenced with static URLs, so map the
// image keys used in wizard.json to their bundled files here.
const images = {
  "paycor-step1": new URL("./assets/paycor-step1.png", import.meta.url),
  "paycor-step2": new URL("./assets/paycor-step2.png", import.meta.url),
  "paycor-step3": new URL("./assets/paycor-step3.png", import.meta.url),
  "paycor-step4": new URL("./assets/paycor-step4.png", import.meta.url),
};

const { screens, ui, support, guide, assistant } = content;
const steps = screens.filter((screen) => screen.type === "step");

const el = {
  chat: document.querySelector("[data-chat]"),
  back: document.querySelector("[data-back]"),
  next: document.querySelector("[data-next]"),
  label: document.querySelector("[data-progress-label]"),
  dots: document.querySelector("[data-progress-dots]"),
  bar: document.querySelector("[data-progress-bar]"),
  fill: document.querySelector("[data-progress-fill]"),
};

let current = 0;

function h(tag, className, children = []) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...[].concat(children));
  return node;
}

function emailLink(address) {
  const link = h("a", null, address);
  link.href = `mailto:${address}`;
  return link;
}

// Turns "**bold**" and email addresses in plain content text into nodes,
// so copy stays in JSON without needing innerHTML.
function formatText(text) {
  const pattern = /(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
  return text.split(pattern).filter(Boolean).map((part) => {
    if (part.startsWith("**")) return h("strong", null, part.slice(2, -2));
    if (part.includes("@")) return emailLink(part);
    return part;
  });
}

function botBubble(children, index, modifier = "") {
  const bubble = h("div", `bubble bubble--bot ${modifier}`.trim(), children);
  bubble.style.setProperty("--i", index);
  return bubble;
}

function renderScreen(screen, cameForward) {
  const thread = [];
  let index = 0;

  const title = h("h2", "chat__title", screen.title);
  title.tabIndex = -1;

  // Echo the reply the user picked on the previous screen, like a chat log.
  const previous = screens[current - 1];
  if (cameForward && previous) {
    thread.push(h("div", "bubble bubble--user", previous.nextLabel));
  }

  thread.push(h("p", "chat__sender", [h("span", "chat__avatar", "d"), assistant.name]));
  screen.messages.forEach((message) => {
    thread.push(botBubble(h("p", null, formatText(message)), index++));
  });

  if (screen.image) {
    const img = h("img");
    img.src = images[screen.image.src];
    img.alt = screen.image.alt;
    img.width = screen.image.width;
    img.height = screen.image.height;
    thread.push(botBubble(h("figure", null, img), index++, "bubble--media"));
  }

  if (screen.note) {
    thread.push(botBubble(h("p", null, formatText(screen.note)), index++, "bubble--note"));
  }

  el.chat.replaceChildren(title, h("div", "chat__thread", thread));
  return title;
}

function renderProgress(screen) {
  const done = screen.type === "complete";
  const stepNumber = screen.type === "step" ? screen.number : done ? steps.length : 0;

  el.label.textContent =
    screen.type === "step"
      ? ui.progress.replace("{current}", stepNumber).replace("{total}", steps.length)
      : done ? ui.completeProgress : ui.introProgress;

  el.bar.setAttribute("aria-valuemax", steps.length);
  el.bar.setAttribute("aria-valuenow", stepNumber);
  el.bar.setAttribute("aria-valuetext", el.label.textContent);
  el.bar.setAttribute("aria-label", "Onboarding progress");
  el.fill.style.width = `${(stepNumber / steps.length) * 100}%`;

  el.dots.replaceChildren(
    ...steps.map((step) => {
      const state =
        step.number < stepNumber || done ? "is-done"
          : step.number === stepNumber ? "is-current" : "";
      const dot = h("li", `wizard__dot ${state}`.trim(), h("span", null, step.title));
      if (state === "is-current") dot.setAttribute("aria-current", "step");
      return dot;
    }),
  );
}

function render({ cameForward = false, focus = false } = {}) {
  const screen = screens[current];
  const title = renderScreen(screen, cameForward);
  renderProgress(screen);

  el.back.textContent = ui.back;
  el.back.hidden = current === 0;
  el.next.textContent = screen.nextLabel;

  if (location.hash.slice(1) !== screen.id) {
    history.replaceState(null, "", `#${screen.id}`);
  }
  if (focus) title.focus();
}

function go(index, options) {
  current = Math.max(0, Math.min(index, screens.length - 1));
  render({ focus: true, ...options });
}

el.next.addEventListener("click", () => {
  if (current === screens.length - 1) go(0);
  else go(current + 1, { cameForward: true });
});

el.back.addEventListener("click", () => go(current - 1));

window.addEventListener("hashchange", () => {
  const index = screens.findIndex((screen) => screen.id === location.hash.slice(1));
  if (index !== -1 && index !== current) go(index);
});

document.querySelector("[data-guide-eyebrow]").textContent = guide.eyebrow;
document.querySelector("[data-guide-provider]").textContent = guide.provider;
document.querySelector("[data-support-heading]").textContent = support.heading;
document.querySelector("[data-support-message]").textContent = support.message;
const supportLink = document.querySelector("[data-support-email]");
supportLink.textContent = support.email;
supportLink.href = `mailto:${support.email}`;

const initial = screens.findIndex((screen) => screen.id === location.hash.slice(1));
current = initial === -1 ? 0 : initial;
render();
