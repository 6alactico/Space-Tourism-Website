const menuButtons = document.querySelectorAll('.menu-btn');
const main = document.querySelector('main');
const navLinks = document.querySelectorAll('nav a[data-type]');
const fadeContainer = document.querySelector('.fade');
const homeHTML = main.innerHTML;
let jsonData;
main.className = 'home';

// Toggle nav menu
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector("nav").classList.toggle('active');
    });
});

// Fetch JSON data
fetch('script/data.json')
    .then(res => {
        if (!res.ok) throw new Error(`Cannot obtain data`);
        return res.json()
    })
    .then(data => {
        jsonData = data;
        navigation();
    })
    .catch(err => console.error('Error fetching JSON:', err));

// Set active navigation link
function setActiveLink(section) {
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeLink = document.querySelector(`nav a[data-type="${section}"]`);
    if (activeLink) activeLink.parentElement.classList.add('active');
}

// Navigation event listeners
function navigation() {
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            crossfadeSection(link.dataset.type);
        });
    });

    const exploreBtn = document.getElementById('explore');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            crossfadeSection("destinations", jsonData.destinations.items?.[0]);
        });
    }
}

// Crossfade transition
function crossfadeSection(section, item = null) {
  if (fadeContainer.classList.contains('is-transitioning')) return;

  if (document.startViewTransition) {
    return document.startViewTransition(() => {
      displayPage(section, item);
      fadeContainer.classList.remove('is-transitioning');
    });
  }

  fadeContainer.addEventListener('transitionend', function handler(e) {
    if (e.propertyName !== 'opacity') return;
    fadeContainer.removeEventListener('transitionend', handler);
    displayPage(section, item);
    fadeContainer.classList.add('fade-active');
    fadeContainer.classList.remove('is-transitioning');
  });

  fadeContainer.classList.remove('fade-active');
}

// Main page display
function displayPage(section, item = null) {
    setActiveLink(section);
    if (section === "home") {
        main.innerHTML = homeHTML;
        setBackground(jsonData.home.background);
        return;
    }

    const sectionData = jsonData[section];
    const selected = item || sectionData.items?.[0];
    if (!selected) console.warn(`No items found in section: ${section}`);

    const displayMap = {
        destinations: displayDestinations,
        crew: displayCrew,
        technology: displayTechnology
    };

    displayMap[section]?.(selected);
    setBackground(sectionData.background || {});
}

// SET BACKGROUND IMAGE
function setBackground(bg) {
    const picture = document.querySelector('.background-image');
    if (!picture) return;
    const mobile = picture.querySelector('.bg-mobile');  
    const tablet = picture.querySelector('.bg-tablet');
    const desktop = picture.querySelector('.bg-desktop');
    if (mobile && bg.mobile) mobile.src = bg.mobile;
    if (tablet && bg.tablet) tablet.srcset = bg.tablet;
    if (desktop && bg.desktop) desktop.srcset = bg.desktop;
}

// Pagination/tabs
function renderButtons(container, items, selectedName, btnClass, labelPrefix = "", isNumbered = false) {
    container.innerHTML = items.map((item, i) => {
        const text = btnClass.includes('sm-dots') ? '': (isNumbered ? i + 1 : item.name);
        return `<button type="button" class="${btnClass}${item.name === selectedName ? ' active' : ''}" data-index="${i}" aria-label="${labelPrefix}${i + 1}">${text}</button>`;
    }).join('');
}

window.addEventListener('resize', () => {
    const nav = document.querySelector('nav');
    if (window.innerWidth >= 768) {
        nav.classList.remove('active');
    }
});

// Destinations
function displayDestinations(selectedItem) {
    const destinations = jsonData.destinations.items;
    main.className = 'pages';
    main.innerHTML = `
    <div class="main-content">
        <h2 class="page title"><span class="number">01</span> Pick your destination</h2>
        <div class="content flex-column">
            <div class="planet flex-row"><img src="${selectedItem.images.webp}" alt="${selectedItem.name}"></div>
            <div class="planet-expl">
                <div class="tabs-menu flex-row"></div>
                <section class="planet-header">
                    <h3 class="planet-name">${selectedItem.name}</h3>
                    <p class="desc dest">${selectedItem.description}</p>
                </section>
                <hr>
                <div class="statistics flex-column">
                    <div class="flex-column">
                        <p>AVG. DISTANCE</p>
                        <span class="data distance">${selectedItem.distance}</span>
                    </div>
                    <div class="flex-column">
                        <p>EST. TRAVEL TIME</p>
                        <span class="data travel">${selectedItem.travel}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    const tabsMenu = document.querySelector('.tabs-menu');
    renderButtons(tabsMenu, destinations, selectedItem.name, 'tabs flex-column');
    tabsMenu.addEventListener('click', e => {
        if (!e.target.classList.contains('tabs')) return;
        crossfadeSection('destinations', destinations[e.target.dataset.index]);
    });
}

// Crew
function displayCrew(selectedItem) {
    const crew = jsonData.crew.items;
    main.className = 'pages';
    main.innerHTML = `
        <div class="main-content">
            <h2 class="page title"><span class="number">02</span> Meet your crew</h2>
            <div class="content flex-column">
                <div class="crew-expl">
                    <div class="text-container">
                        <section class="page-header crew">
                            <span class="role">${selectedItem.role}</span>
                            <h3 class="crew-name">${selectedItem.name}</h3>
                        </section>
                        <p class="desc crew">${selectedItem.bio}</p>
                    </div>
                    <div class="pagination pagination-sm flex-row"></div>
                </div>
                <div class="crew-img flex-row">
                    <img src="${selectedItem.images.webp}" alt="${selectedItem.name}">
                </div>
            </div>
        </div>
    `;
            
    const paginationSm = document.querySelector('.pagination-sm');
    renderButtons(paginationSm, crew, selectedItem.name, 'sm-dots dot', "Slide ");
    paginationSm.addEventListener('click', e => {
        const button = e.target.closest('.sm-dots');
        if (!button) return;
        crossfadeSection('crew', crew[button.dataset.index]);
    });
}

// Technology
function displayTechnology(selectedItem) {
    const technology = jsonData.technology.items;
    main.className = 'pages';

    main.innerHTML = `
        <div class="main-content tech">
            <h2 class="page title"><span class="number">03</span> Space Launch 101</h2>
            <div class="content tech flex-column">
                <picture class="tech-images flex-row">
                    <source class="portrait" media="(min-width: 64rem)"
                    srcset="${selectedItem.images.portrait}">
                    <source class="landscape" media="(min-width: 48rem)"
                    srcset="${selectedItem.images.landscape}">
                    <img src="${selectedItem.images.portrait}" alt="${selectedItem.name}">
                </picture>
                <div class="bottom-content">
                    <div class="pagination pagination-lg flex-row"></div>
                    <div class="text-container">
                        <div class="page-header">
                            <p class="role">THE TERMINOLOGY...</p>
                            <p class="term-name">${selectedItem.name}</p>
                        </div>
                        <p class="desc tech">${selectedItem.description}</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const paginationLg = document.querySelector('.pagination-lg');
    renderButtons(paginationLg, technology, selectedItem.name, 'lg-dots dot flex-column', "Slide ", true);
    paginationLg.addEventListener('click', e => {
        const button = e.target.closest('.lg-dots');
        if (!button) return;
        crossfadeSection('technology', technology[button.dataset.index]);
    });
}