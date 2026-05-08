document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`./data.json?t=${new Date().getTime()}`);
    const data = await response.json();
    
    renderProfile(data.profile);
    renderTabs(data.tabs);
    renderAbout(data.about);
    renderSkills(data.skills);
    renderExperience(data.experience);
    renderProjects(data.projects);
    renderFuture(data.future);

    setupTabLogic();
    setupLightbox();
    
    // Sticky header shrink effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Trigger initial tab
    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) firstTab.click();

  } catch (error) {
    console.error('Error loading data:', error);
    document.getElementById('main-container').innerHTML = '<p style="color:red;">載入資料失敗，請確認 data.json 格式是否正確。</p>';
  }
});

function renderProfile(profile) {
  document.title = `${profile.name} | ${profile.title}`;
  
  const logoHtml = profile.logo ? `<div class="profile-logo"><img src="${profile.logo}" alt="Logo"></div>` : '';
  
  document.getElementById('profile-container').innerHTML = `
    <div class="profile-header-wrapper">
      <div class="profile-text-content">
        <h1>${profile.name} <span>${profile.englishName}</span></h1>
        <p class="subtitle">${profile.title}</p>
      </div>
      ${logoHtml}
    </div>
  `;
}

function renderTabs(tabs) {
  const container = document.getElementById('tabs-container');
  container.innerHTML = tabs.map((tab, index) => 
    `<button class="tab-btn" data-target="${tab.id}">${tab.icon} ${tab.label}</button>`
  ).join('');
}

function generateImageGalleryHtml(images) {
  if (!images || images.length === 0) return '';
  return `
    <div class="image-gallery fade-in delay-2">
      ${images.map(img => {
        const src = typeof img === 'string' ? img : img.src;
        const caption = typeof img === 'string' ? '' : (img.caption || '');
        const position = typeof img === 'string' ? 'center center' : (img.position || 'center center');
        const height = typeof img === 'string' ? '' : (img.height || '');
        const width = typeof img === 'string' ? '' : (img.width || '');
        const objectFit = typeof img === 'string' ? '' : (img.objectFit || '');
        
        let inlineStyle = `object-position: ${position};`;
        if (height) inlineStyle += ` height: ${height};`;
        if (width) inlineStyle += ` width: ${width};`;
        if (objectFit) inlineStyle += ` object-fit: ${objectFit};`;

        const captionHtml = caption ? `<div class="gallery-caption">${caption}</div>` : '';
        
        return `
          <div class="gallery-img-wrapper">
            <img src="${src}" alt="${caption || '圖片'}" class="gallery-img" style="${inlineStyle}">
            ${captionHtml}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderAbout(about) {
  const autobiographyHtml = about.autobiography ? `
    <div class="glass-card fade-in">
      <h2>${about.autobiography.title}</h2>
      <p class="intro-text">${about.autobiography.content}</p>
      ${generateImageGalleryHtml(about.autobiography.images)}
    </div>
  ` : '';

  const reflectionHtml = about.reflection ? `
    <div class="glass-card fade-in delay-2" style="margin-top: 2rem;">
      <h2>${about.reflection.title}</h2>
      <p class="intro-text">${about.reflection.content}</p>
      ${generateImageGalleryHtml(about.reflection.images)}
    </div>
  ` : '';

  const html = `
    ${autobiographyHtml}
    <div class="glass-card fade-in delay-1">
      <h2>${about.title}</h2>
      <p class="intro-text">${about.intro}</p>
      <div class="grid-2">
        ${about.features.map(f => `
          <div class="feature-box">
            <div class="icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>
        `).join('')}
      </div>
      ${generateImageGalleryHtml(about.images)}
    </div>
    ${reflectionHtml}
  `;
  document.getElementById('about').innerHTML = html;
}

function renderSkills(skills) {
  const trainingHtml = skills.trainings ? `
    <div class="glass-card fade-in" style="margin-bottom: 2rem;">
      <h2>${skills.trainingTitle}</h2>
      <div class="plan-grid mt-4">
        ${skills.trainings.map(t => `
          <div class="plan-card">
            <h4>${t.category}</h4>
            <ul>
              ${t.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const visionHtml = skills.vision ? `
    <div class="glass-card fade-in delay-2" style="margin-top: 2rem;">
      <h2>${skills.vision.title}</h2>
      <p class="intro-text">${skills.vision.content}</p>
    </div>
  ` : '';

  const html = `
    ${trainingHtml}
    
    <div class="glass-card fade-in delay-1" style="margin-bottom: 2rem;">
      <h2>${skills.certTitle}</h2>
      <ul class="cert-list">
        ${skills.certs.map(c => `
          <li>
            <div class="cert-title">${c.name} ${c.badges.map(b => `<span class="badge ${b.type}">${b.label}</span>`).join(' ')}</div>
            <p>${c.desc}</p>
          </li>
        `).join('')}
      </ul>
      ${generateImageGalleryHtml(skills.certImages)}
    </div>

    <div class="glass-card fade-in delay-2">
      <h2>${skills.toolTitle}</h2>
      ${skills.tools.map(t => `
        <div class="skill-item">
          <div class="skill-header">
            <span>${t.name}</span>
            <span>${t.levelText}</span>
          </div>
          <div class="skill-bar"><div class="skill-fill" style="width: ${t.levelPercent}%"></div></div>
          <p class="skill-desc">${t.desc}</p>
        </div>
      `).join('')}
      ${generateImageGalleryHtml(skills.toolImages)}
    </div>

    ${visionHtml}
    ${generateImageGalleryHtml(skills.images)}
  `;
  document.getElementById('skills').innerHTML = html;
}

function renderTimelineItem(e) {
  let imgHtml = '';
  if (e.img) {
    const imgs = Array.isArray(e.img) ? e.img : [e.img];
    imgHtml = `
      <div class="timeline-img-container ${imgs.length > 1 ? 'multi-img' : ''}">
        ${imgs.map(src => `<img src="${src}" alt="${e.title}" class="timeline-img">`).join('')}
      </div>
    `;
  }

  return `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-date">${e.year}</div>
      <div class="timeline-flex">
        <div class="timeline-text">
          <div class="timeline-content">
            <h3>${e.title}</h3>
            ${e.items.map(item => `<p>${item}</p>`).join('')}
          </div>
        </div>
        ${imgHtml}
      </div>
    </div>
  `;
}

function renderExperience(exp) {
  const litHtml = exp.literature ? `
    <div class="timeline glass-card fade-in delay-1" style="margin-top: 2rem;">
      <h2>${exp.literature.title}</h2>
      ${exp.literature.events.map(e => renderTimelineItem(e)).join('')}
    </div>
  ` : '';

  const skillCompHtml = exp.skillCompetitions ? `
    <div class="timeline glass-card fade-in delay-1" style="margin-top: 2rem;">
      <h2>${exp.skillCompetitions.title}</h2>
      ${exp.skillCompetitions.events.map(e => renderTimelineItem(e)).join('')}
    </div>
  ` : '';

  const summaryHtml = exp.summary ? `
    <div class="glass-card fade-in delay-2" style="margin-top: 2rem;">
      <h2>${exp.summary.title}</h2>
      <p class="intro-text">${exp.summary.content}</p>
    </div>
  ` : '';

  const html = `
    <div class="timeline glass-card fade-in">
      <h2>${exp.title}</h2>
      ${exp.events.map(e => renderTimelineItem(e)).join('')}
    </div>
    ${skillCompHtml}
    ${litHtml}
    ${summaryHtml}
    ${generateImageGalleryHtml(exp.images)}
  `;
  document.getElementById('experience').innerHTML = html;
}

function renderProjects(proj) {
  const html = `
    <div class="glass-card fade-in">
      <h2>${proj.title}</h2>
      <div class="project-content">
        <div class="project-text">
          <h3>${proj.motivationTitle}</h3>
          <p>${proj.motivation}</p>
          
          <h3 style="margin-top:1.5rem;">${proj.principleTitle}</h3>
          <p>${proj.principle}</p>
          
          <div class="quote-box">"${proj.quote}"</div>
        </div>
      </div>
      ${generateImageGalleryHtml(proj.images)}
    </div>
  `;
  document.getElementById('projects').innerHTML = html;
}

function renderFuture(future) {
  const html = `
    <div class="glass-card fade-in">
      <h2>${future.title}</h2>
      <div class="grid-3 mt-4">
        ${future.schools.map(s => `
          <div class="future-box">
            <h3>${s.target}<br><small>(${s.major})</small></h3>
            <p>${s.desc}</p>
          </div>
        `).join('')}
      </div>

      <div class="plan-section mt-4">
        <h2>${future.planTitle}</h2>
        <div class="plan-grid">
          ${future.plans.map(p => `
            <div class="plan-card">
              <h4>${p.term}</h4>
              <ul>
                ${p.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
      ${generateImageGalleryHtml(future.images)}
    </div>
  `;
  document.getElementById('future').innerHTML = html;
}

function setupTabLogic() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      
      if (targetContent) {
        targetContent.classList.add('active');
        const animatedElements = targetContent.querySelectorAll('.fade-in');
        animatedElements.forEach(el => {
          el.style.animation = 'none';
          el.offsetHeight; 
          el.style.animation = null;
        });
      }
    });
  });
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');

  // Use event delegation for images that might be dynamically rendered
  document.getElementById('main-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('gallery-img') || e.target.classList.contains('timeline-img')) {
      lightboxImg.src = e.target.src;
      lightboxCaption.innerText = e.target.alt !== '圖片' ? e.target.alt : '';
      
      // Force display flex before adding show class for transition to work
      lightbox.style.display = 'flex';
      // Small timeout to allow display:flex to apply before setting opacity
      setTimeout(() => {
        lightbox.classList.add('show');
      }, 10);
      
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
    }
  });

  const closeLightbox = () => {
    lightbox.classList.remove('show');
    // Wait for transition to finish before hiding
    setTimeout(() => {
      lightbox.style.display = 'none';
    }, 300);
    document.body.style.overflow = 'auto';
  };

  closeBtn.addEventListener('click', closeLightbox);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('show')) {
      closeLightbox();
    }
  });
}
