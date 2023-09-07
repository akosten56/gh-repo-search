const body = document.querySelector('body');
const savedList = body.querySelector('.save-list');
const searchInput = body.querySelector('.search-input');
const autoCompletion = body.querySelector('.auto-completion');

const debounce = (fn, debounceTime) => {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, arguments), debounceTime);
  };
};

async function getRepo(repoName) {
  try {
    const data = await fetch(
      `https://api.github.com/search/repositories?q=${repoName}`
    );
    const response = await data.json();
    const firstFiveRepo = response.items.slice(0, 5);
    return firstFiveRepo;
  } catch (error) {
    console.error(error);
  }
}

class Repo {
  constructor(obj) {
    this.name = obj.name;
    this.owner = obj.owner.login;
    this.stars = obj.stargazers_count;
  }
}

function addRepoTips(arrOfRepo) {
  if (autoCompletion.children.length) {
    cleanRepoTips();
  }
  if (!arrOfRepo.length) {
    return;
  }
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < arrOfRepo.length; i++) {
    const li = document.createElement('li');
    const tip = document.createElement('button');
    tip.classList.add('tip');
    tip.textContent = arrOfRepo[i].name;
    tip.addEventListener(
      'click',
      () => {
        addRepoToSaved(new Repo(arrOfRepo[i]));
      },
      { once: true }
    );
    li.append(tip);
    fragment.append(li);
  }
  autoCompletion.prepend(fragment);
}

function cleanRepoTips() {
  let arrOfTips = [...autoCompletion.children];
  for (let i = 0; i < 5; i++) {
    arrOfTips[i].removeEventListener(
      'click',
      () => {
        addRepoToSaved;
      },
      { once: true }
    );
    arrOfTips[i].remove();
  }
}

async function showRepoTips(repoName) {
  const repo = await getRepo(repoName);
  addRepoTips(repo);
}

const debounceShowRepoTips = debounce(showRepoTips, 300);

function addRepoToSaved(infoOfRepo) {
  savedList.insertAdjacentHTML(
    'afterbegin',
    `<li class="saved">
      <div class="info">
        <p>Name: ${infoOfRepo.name}</p>
        <p>Owner: ${infoOfRepo.owner}</p>
        <p>Stars: ${infoOfRepo.stars}</p>
      </div>
      <button class="delete"></button>
    </li>`
  );
  cleanRepoTips();
}

savedList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete')) {
    e.target.parentElement.remove();
  }
});

searchInput.addEventListener('keyup', (e) => {
  const request = e.target.value;
  if (request) debounceShowRepoTips(request);
  else if (autoCompletion.children.length) {
    cleanRepoTips();
  }
});
