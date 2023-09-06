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
  let fragment = document.createDocumentFragment();
  for (let i = 0; i < arrOfRepo.length; i++) {
    const tip = document.createElement('div');
    tip.classList.add('tip');
    tip.textContent = arrOfRepo[i].name;
    tip.dataset.info = JSON.stringify(new Repo(arrOfRepo[i]));
    fragment.prepend(tip);
  }
  autoCompletion.prepend(fragment);
}

function cleanRepoTips() {
  let arrOfTips = [...autoCompletion.children];
  for (let i = 0; i < 5; i++) {
    arrOfTips[i].remove();
  }
}

async function showRepoTips(repoName) {
  const repo = await getRepo(repoName);
  console.log(repo);
  addRepoTips(repo);
}

const debounceShowRepoTips = debounce(showRepoTips, 200);

function addRepoToSaved(repo) {
  const infoOfRepo = JSON.parse(repo.dataset.info);
  let fragment = document.createDocumentFragment();
  const savedDiv = document.createElement('div');
  savedDiv.classList.add('saved');

  const infoDiv = document.createElement('div');
  infoDiv.classList.add('info');

  const pName = document.createElement('p');
  pName.textContent = 'Name: ' + infoOfRepo.name;
  infoDiv.appendChild(pName);

  const pOwner = document.createElement('p');
  pOwner.textContent = 'Owner ' + infoOfRepo.owner;
  infoDiv.appendChild(pOwner);

  const pStars = document.createElement('p');
  pStars.textContent = 'Stars: ' + infoOfRepo.stars;
  infoDiv.appendChild(pStars);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete');

  savedDiv.appendChild(infoDiv);
  savedDiv.appendChild(deleteButton);
  fragment.prepend(savedDiv);
  savedList.prepend(fragment);
}

savedList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete')) {
    e.target.parentElement.remove();
  }
});

searchInput.addEventListener('keyup', (e) => {
  const request = e.target.value;
  if (request) debounceShowRepoTips(request);
  else if (autoCompletion.children.length) cleanRepoTips();
});

autoCompletion.addEventListener('click', (e) => {
  if (e.target.closest('.tip')) {
    addRepoToSaved(e.target);
    cleanRepoTips();
  }
});
