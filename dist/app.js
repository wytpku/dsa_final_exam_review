"use strict";

const examPapers = window.DSA_PAPERS.filter(paper => paper.kind !== "homework").sort((a, b) =>
  b.id.slice(0, 4).localeCompare(a.id.slice(0, 4)) || a.id.localeCompare(b.id)
);
const homeworkPapers = window.DSA_PAPERS.filter(paper => paper.kind === "homework").sort((a, b) => a.id.localeCompare(b.id));
const papers = [...examPapers, ...homeworkPapers];
const sourceScopes = new Map([["all", "全部题目"], ["exams", "期末真题"], ["homework", "书面作业"]]);
const sourceSelectLabels = new Map([["all", "全部试卷和章节"], ["exams", "全部试卷"], ["homework", "全部作业章节"]]);
const papersById = new Map(papers.map(paper => [paper.id, paper]));
const topicGroups = window.DSA_TOPIC_GROUPS;
const topicNames = new Map(topicGroups.flatMap(group => group.topics));
const topicSets = new Map([...topicNames.keys()].map(id => [id, new Set([id])]));
for (const group of topicGroups) topicSets.set(`group:${group.id}`, new Set(group.topics.map(([id]) => id)));

const questions = papers.flatMap(paper => paper.questions.map(question => ({
  ...question,
  id: `${paper.id}/${question.ref}`,
  topics: question.topics ?? window.DSA_EXAM_TOPICS[paper.id]?.[question.ref] ?? [],
  paper,
})));
const byId = new Map(questions.map(question => [question.id, question]));
const storageKey = "dsa-final-practice-v1";
const defaultState = { paper: "all", topic: "all", filter: "all", questionId: "", records: {} };
const filterNames = { all: "全部", todo: "待完成", wrong: "待订正", done: "已完成" };
const statusNames = { new: "未作答", draft: "答题中", wrong: "待订正", done: "已完成" };
const get = id => document.getElementById(id);

let state = readState();
let activeId = state.questionId;
let advanceTimer = null;
let pendingNextId = null;
let feedback = null;
let referenceOpen = false;

if (!(state.filter in filterNames)) state.filter = "all";
if (!sourceScopes.has(state.paper) && !papersById.has(state.paper)) state.paper = "all";
if (!topicSets.has(state.topic)) state.topic = "all";
if (!matchingQuestions().some(question => question.id === activeId)) {
  activeId = matchingQuestions()[0]?.id ?? "";
}
get("bank-size").textContent = `${examPapers.length} 套期末卷 · ${homeworkPapers.length} 组书面作业 · ${questions.length} 道练习题`;
if (matchMedia("(max-width: 620px)").matches) get("paper-panel").open = false;
setupSourceFilters();
setupTopicFilter();
render();

function readState(reportError = true) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return { ...defaultState, ...saved, records: saved.records ?? {} };
  } catch (error) {
    if (reportError) showStorageError();
    return { ...defaultState, records: {} };
  }
}

function showStorageError() {
  const indicator = get("save-status");
  indicator.classList.add("error");
  indicator.lastChild.textContent = "当前浏览器无法读写进度";
}

function persist(change) {
  const latest = readState(false);
  state = { ...state, records: { ...state.records, ...latest.records } };
  change(state);
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    showStorageError();
  }
}

function persistView(recordsChange = () => {}) {
  const { paper, topic, filter } = state;
  persist(saved => {
    saved.paper = paper;
    saved.topic = topic;
    saved.filter = filter;
    saved.questionId = pendingNextId ?? activeId;
    recordsChange(saved.records);
  });
}

function saveAnswer(question, values, outcome) {
  persistView(records => {
    const previous = records[question.id] ?? {};
    const complete = previous.status === "done" || outcome === "done";
    const status = complete ? "done" : outcome ?? previous.status ?? "draft";
    records[question.id] = {
      ...previous,
      draft: values,
      status,
    };
  });
}

function inPaperScope(question, scope) {
  if (scope === "all") return true;
  if (scope === "exams") return question.paper.kind !== "homework";
  if (scope === "homework") return question.paper.kind === "homework";
  return question.paper.id === scope;
}

function matchingQuestions() {
  const topicSet = topicSets.get(state.topic);
  return questions.filter(question => {
    if (!inPaperScope(question, state.paper)) return false;
    if (topicSet && !question.topics.some(topic => topicSet.has(topic))) return false;
    const status = state.records[question.id]?.status;
    if (state.filter === "todo") return status !== "done";
    if (state.filter === "wrong") return status === "wrong";
    if (state.filter === "done") return status === "done";
    return true;
  });
}

function element(tag, className, copy) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (copy !== undefined) node.textContent = copy;
  return node;
}

function button(label, className, onClick) {
  const control = element("button", className, label);
  control.type = "button";
  control.addEventListener("click", onClick);
  return control;
}

function link(label, path, page) {
  const anchor = element("a", "", label);
  anchor.href = page ? `${path}#page=${page}` : path;
  anchor.target = "_blank";
  anchor.rel = "noopener";
  return anchor;
}

function renderProgress() {
  const done = questions.filter(question => state.records[question.id]?.status === "done").length;
  const started = questions.filter(question => state.records[question.id]).length;
  get("progress").max = questions.length || 1;
  get("progress").value = done;
  get("progress-text").textContent = `${done} / ${questions.length}`;
  get("progress-detail").textContent = `已开始 ${started} 题 · 完成 ${questions.length ? Math.floor(100 * done / questions.length) : 0}%`;
}

function option(id, copy) {
  const item = element("option", "", copy);
  item.value = id;
  return item;
}

function optionGroup(label, options) {
  const group = element("optgroup");
  group.label = label;
  group.append(...options);
  return group;
}

function sourceGroup() {
  const source = papersById.get(state.paper);
  return source ? (source.kind === "homework" ? "homework" : "exams") : state.paper;
}

function setupSourceFilters() {
  const scopes = get("source-scopes");
  for (const [id, label] of sourceScopes) {
    const item = button("", "paper", () => {
      state.paper = id;
      applyFilters();
    });
    item.dataset.scope = id;
    item.append(element("span", "paper-label", label), element("span", "paper-count"));
    scopes.append(item);
  }
  const sourceSelect = get("source-select");
  sourceSelect.append(option("", "全部试卷和章节"));
  for (const [label, list] of [
    ["期末真题", examPapers],
    ["书面作业", homeworkPapers.filter(paper => !paper.archive)],
    ["2022 秋书面作业", homeworkPapers.filter(paper => paper.archive)],
  ]) {
    if (list.length) sourceSelect.append(optionGroup(label, list.map(paper => option(paper.id, paper.label))));
  }
  sourceSelect.addEventListener("change", () => {
    state.paper = sourceSelect.value || sourceGroup();
    applyFilters();
    if (sourceSelect.value && matchMedia("(max-width: 620px)").matches) get("paper-panel").open = false;
  });
}

function renderSourceFilters() {
  const source = papersById.get(state.paper);
  const scope = sourceGroup();
  get("paper-selection").textContent = source?.label ?? sourceScopes.get(scope);
  const select = get("source-select");
  select.options[0].textContent = sourceSelectLabels.get(scope);
  select.value = source?.id ?? "";
  for (const item of get("source-scopes").children) {
    const id = item.dataset.scope;
    const scoped = questions.filter(question => inPaperScope(question, id));
    const done = scoped.filter(question => state.records[question.id]?.status === "done").length;
    item.setAttribute("aria-pressed", String(id === scope));
    item.querySelector(".paper-count").textContent = `${done}/${scoped.length}`;
  }
}

function setupTopicFilter() {
  const select = get("topic-select");
  select.append(option("all", "全部知识点"));
  for (const group of topicGroups) {
    select.append(optionGroup(group.label, [
      option(`group:${group.id}`, `全部${group.label}`),
      ...group.topics.map(([id, label]) => option(id, label)),
    ]));
  }
  select.addEventListener("change", () => {
    state.topic = select.value;
    applyFilters();
  });
}

function applyFilters() {
  clearIndexSearch();
  const matching = matchingQuestions();
  const current = matching.find(question => question.id === activeId);
  selectQuestion(current?.id ?? matching[0]?.id);
}

function render() {
  renderProgress();
  renderSourceFilters();
  get("topic-select").value = state.topic;
  for (const filter of document.querySelectorAll("[data-filter]")) {
    filter.setAttribute("aria-pressed", String(filter.dataset.filter === state.filter));
  }
  const matching = matchingQuestions();
  get("match-count").textContent = `${matching.length} 道匹配`;
  const current = byId.get(activeId);
  renderQuestion(current);
  renderNavigation(matching);
  if (!get("question-index").hidden) renderIndex(matching);
}

function selectQuestion(id, focus = false) {
  clearTimeout(advanceTimer);
  advanceTimer = null;
  pendingNextId = null;
  activeId = id ?? "";
  feedback = null;
  referenceOpen = false;
  persistView();
  render();
  if (focus) {
    const title = get("question-title");
    title?.focus({ preventScroll: true });
    const card = get("question");
    const top = card.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.65) card.scrollIntoView({ block: "start" });
  }
}

function renderNavigation(matching) {
  const rank = matching.findIndex(question => question.id === activeId);
  get("previous").disabled = rank < 1;
  get("next").disabled = rank < 0 || rank >= matching.length - 1;
  get("previous").onclick = () => selectQuestion(matching[rank - 1]?.id, true);
  get("next").onclick = () => selectQuestion(matching[rank + 1]?.id, true);
  get("position").textContent = rank >= 0 ? `第 ${rank + 1} / ${matching.length} 题` : "";
}

function renderQuestion(question) {
  const card = get("question");
  const body = element("div", "question-body");
  card.replaceChildren(body);
  if (!question) {
    body.append(element("h2", "", questions.length ? "当前筛选下没有题目" : "题库未能载入"));
    if (questions.length) {
      body.append(element("p", "empty", "可以调整来源、知识点或做题状态继续练习。"));
    }
    if (feedback) body.append(element("p", `feedback ${feedback.type}`, feedback.text));
    return;
  }

  const type = question.options
    ? (question.options.length === 2 && question.options.every(option => /^[对错是否正误√×]|^(true|false)$/i.test(option.trim())) ? "判断题" : "选择题")
    : question.answers ? "填空题" : "开放题 · 自评";
  const meta = element("div", "question-meta");
  const metadata = element("div", "metadata");
  const homework = question.paper.kind === "homework";
  const origin = element("span", "source", `${homework ? "书面作业 · " : ""}${question.paper.label} · ${question.ref}`);
  if (question.paper.details) origin.title = question.paper.details;
  metadata.append(origin, element("span", "type", type));
  const status = state.records[question.id]?.status;
  if (status === "done") metadata.append(element("span", "type", "已完成"));
  const links = element("div", "source-links");
  const source = question.source ?? question.paper.source;
  if (source) {
    const name = homework ? "作业" : "原卷";
    const sourceLink = link(question.page ? `${name}第 ${question.page} 页 ↗` : `查看${name} ↗`, source, question.page);
    if (homework) sourceLink.title = "作业 PDF 内可能附有解答";
    links.append(sourceLink);
  } else if (question.paper.sourceName) {
    links.append(element("span", "source-file", `${question.paper.sourceName} · 第 ${question.page} 页`));
  }
  meta.append(metadata, links);

  const title = element("h2", "", question.title);
  title.id = "question-title";
  title.tabIndex = -1;
  body.append(meta, title);
  if (question.topics.length) {
    const tags = element("div", "topic-tags");
    tags.setAttribute("aria-label", "本题知识点");
    tags.setAttribute("role", "group");
    for (const topic of question.topics) {
      const tag = button(topicNames.get(topic), "topic-tag", () => {
        state.topic = state.topic === topic ? "all" : topic;
        applyFilters();
        get("topic-select").focus();
      });
      tag.title = `按${topicNames.get(topic)}筛选`;
      tag.setAttribute("aria-pressed", String(state.topic === topic));
      tags.append(tag);
    }
    body.append(tags);
  }
  body.append(element("p", "prompt", question.prompt));
  if (question.images?.length) renderFigures(body, question.images);
  if (question.note) body.append(element("p", "note", question.note));

  const form = element("form", "answer-form");
  const draft = state.records[question.id]?.draft ?? [];
  const inputs = question.options ? renderOptions(form, question, draft) : renderTextFields(form, question, draft);
  const values = () => question.options
    ? inputs.filter(input => input.checked).map(input => Number(input.value))
    : inputs.map(input => input.value);
  form.addEventListener("input", () => saveAnswer(question, values()));

  const actions = element("div", "actions");
  const submit = element("button", "primary", question.model && !question.options && !question.answers ? "提交并对照" : "提交答案");
  submit.type = "submit";
  submit.disabled = advanceTimer !== null;
  const reveal = button(referenceOpen ? "收起答案" : "查看答案", "secondary", () => {
    referenceOpen = !referenceOpen;
    renderQuestion(question);
    get("reveal")?.focus({ preventScroll: true });
  });
  reveal.id = "reveal";
  reveal.setAttribute("aria-expanded", String(referenceOpen));
  reveal.setAttribute("aria-controls", "reference");
  actions.append(submit, reveal);

  const needsSelfReview = !question.options && !question.answers;
  if (needsSelfReview && referenceOpen) {
    const reviewButtons = [
      button("自评答对", "secondary", () => recordOutcome(question, values(), "done")),
      button("自评需订正", "secondary", () => recordOutcome(question, values(), "wrong"))
    ];
    for (const control of reviewButtons) {
      control.disabled = advanceTimer !== null;
      actions.append(control);
    }
  }
  form.append(actions);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const input = values();
    if (advanceTimer !== null) return;
    if (needsSelfReview) {
      saveAnswer(question, input);
      referenceOpen = true;
      feedback = { type: "info", text: "对照参考解答后，可以自评并记录结果。" };
      render();
      return;
    }
    if (!input.length || input.some(value => String(value).trim() === "")) {
      feedback = { type: "info", text: "请先填好答案再提交。" };
      renderQuestion(question);
      return;
    }
    const correct = question.options
      ? input.length === question.correct.length && input.every(value => question.correct.includes(value))
      : input.every((value, index) => question.answers[index].some(answer => normalize(answer) === normalize(value)));
    recordOutcome(question, input, correct ? "done" : "wrong");
  });

  if (feedback) form.append(element("p", `feedback ${feedback.type}`, feedback.text));
  body.append(form);
  const reference = element("section", "reference");
  reference.id = "reference";
  reference.hidden = !referenceOpen;
  if (referenceOpen) renderReference(reference, question);
  body.append(reference);
}

function renderFigures(target, images) {
  const figures = element("div", "figures");
  for (const image of images) {
    const anchor = link("", image.src);
    const img = new Image();
    img.src = image.src;
    img.alt = image.alt;
    anchor.append(img);
    figures.append(anchor);
  }
  target.append(figures);
}

function renderOptions(form, question, draft) {
  const field = element("fieldset", "");
  const multiple = question.correct.length > 1;
  field.append(element("legend", "", multiple ? "可选多项" : "请选择一项"));
  const choices = element("div", "choices");
  const inputs = question.options.map((choice, index) => {
    const label = element("label", "choice");
    const input = element("input");
    input.type = multiple ? "checkbox" : "radio";
    input.name = "choice";
    input.value = index;
    input.checked = draft.includes(index);
    label.append(input, element("span", "choice-letter", optionLetter(index)), element("span", "choice-copy", choice));
    choices.append(label);
    return input;
  });
  field.append(choices);
  form.append(field);
  return inputs;
}

function renderTextFields(form, question, draft) {
  const stack = element("div", "input-stack");
  const labels = question.answers
    ? question.answers.map((_, index) => question.fields?.[index] ?? (question.answers.length > 1 ? `第 ${index + 1} 空` : "你的答案"))
    : ["你的解答"];
  const inputs = labels.map((copy, index) => {
    const label = element("label", "input-label", copy);
    const input = question.answers ? element("input") : element("textarea");
    if (question.answers) input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.value = draft[index] ?? "";
    label.append(input);
    stack.append(label);
    return input;
  });
  form.append(stack);
  return inputs;
}

function optionLetter(index) {
  return String.fromCharCode(65 + index);
}

function normalize(value) {
  const normalized = String(value)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, power => `^${power.normalize("NFKC")}`)
    .normalize("NFKC").toLowerCase().trim()
    .replace(/;$/, "")
    .replace(/[、，;；]/g, ",")
    .replace(/[−–]/g, "-")
    .replace(/[·×]/g, "*").trim();
  if (/^[+-]?\d+(?:[,\s]+[+-]?\d+)+$/.test(normalized)) {
    return normalized.replace(/[,\s]+/g, ",");
  }
  return normalized
    .replace(/\s*([,+*/%^=&|!()\[\]{}<>-])\s*/g, "$1")
    .replace(/\s+/g, " ").trim();
}

function renderReference(target, question) {
  target.append(element("h3", "", "参考解答"));
  if (question.options) {
    const choices = question.correct.map(index => `${optionLetter(index)}. ${question.options[index]}`);
    target.append(element("p", "reference-copy", choices.join("\n")));
  }
  if (question.answers) {
    const copy = question.answers.map((answers, index) => {
      const label = question.fields?.[index] ?? `第 ${index + 1} 空`;
      return question.answers.length > 1 ? `${label}　${answers[0]}` : answers[0];
    }).join("\n");
    target.append(element("p", "reference-copy", copy));
  }
  if (question.model) target.append(element("p", "reference-copy", question.model));
  if (question.explanation) target.append(element("p", "reference-copy", question.explanation));
  const source = question.answerSource ?? question.paper.answerSource;
  if (source) {
    const label = question.paper.kind === "homework" ? "查看作业原解 ↗" : "查看随卷参考答案 ↗";
    target.append(link(label, source, question.answerPage));
  }
}

function recordOutcome(question, input, outcome) {
  if (advanceTimer !== null) return;
  const before = matchingQuestions();
  const rank = before.findIndex(item => item.id === question.id);
  let next;
  if (outcome === "done") {
    next = before[rank + 1];
    if (!next && (state.filter === "wrong" || state.filter === "todo")) next = before.find(item => item.id !== question.id);
  }
  pendingNextId = next?.id ?? null;
  saveAnswer(question, input, outcome);
  if (outcome === "wrong") {
    feedback = { type: "wrong", text: "这次答案有误，已记录为待订正。可以修改后再提交。" };
    if (state.records[question.id].status === "done") {
      feedback.text = "这次作答需订正，已保留之前的完成记录。";
    }
    get("announcement").textContent = feedback.text;
    render();
    return;
  }

  const correctMessage = question.options || question.answers ? "回答正确" : "已记录自评答对";
  feedback = { type: "correct", text: next ? `${correctMessage}，正在进入下一题。` : `${correctMessage}，已到当前题组最后一题。` };
  get("announcement").textContent = feedback.text;
  if (next) {
    advanceTimer = setTimeout(() => selectQuestion(next.id, true), 650);
  } else if (state.filter === "wrong" || state.filter === "todo") {
    activeId = "";
    persistView();
  }
  render();
}

function renderIndex(matching) {
  const index = get("question-index");
  if (!index.childNodes.length) {
    const search = element("input");
    search.type = "text";
    search.id = "index-search";
    search.placeholder = "搜索题名、来源、题号或知识点";
    search.setAttribute("aria-label", search.placeholder);
    const list = element("div", "index-list");
    list.id = "index-list";
    index.append(search, list);
    search.addEventListener("input", () => renderIndex(matchingQuestions()));
  }
  const query = get("index-search").value.toLowerCase().trim();
  const list = get("index-list");
  list.replaceChildren();
  const results = matching.filter(question => {
    const topics = question.topics.map(id => topicNames.get(id)).join(" ");
    const searchText = `${question.title} ${question.paper.label} ${question.ref} ${topics}`;
    return searchText.toLowerCase().includes(query);
  });
  for (const question of results) {
    const row = button("", "index-row", () => {
      toggleIndex(false);
      selectQuestion(question.id, true);
    });
    if (question.id === activeId) row.setAttribute("aria-current", "true");
    const status = state.records[question.id]?.status ?? "new";
    row.append(
      element("span", "index-source", `${question.paper.label} · ${question.ref}`),
      element("strong", "", question.title),
      element("small", "", statusNames[status])
    );
    list.append(row);
  }
  if (!results.length) list.append(element("p", "empty", "没有匹配的题目。"));
}

function clearIndexSearch() {
  if (get("index-search")) get("index-search").value = "";
}

function toggleIndex(open) {
  get("toggle-index").setAttribute("aria-expanded", String(open));
  get("question-index").hidden = !open;
  if (open) {
    renderIndex(matchingQuestions());
    get("index-search").focus();
  }
}

get("toggle-index").addEventListener("click", () => toggleIndex(get("question-index").hidden));
for (const filter of document.querySelectorAll("[data-filter]")) {
  filter.addEventListener("click", () => {
    state.filter = filter.dataset.filter;
    applyFilters();
  });
}
