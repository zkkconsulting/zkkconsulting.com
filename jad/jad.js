const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
/* nav state + scroll progress */
const nav=$('#jnav'),bar=$('#jprog');
const onScroll=()=>{nav.classList.toggle('solid',scrollY>40);const h=document.documentElement;bar.style.transform=`scaleX(${scrollY/Math.max(1,h.scrollHeight-innerHeight)})`};
addEventListener('scroll',onScroll,{passive:true});onScroll();
/* menu */
const menu=$('#jmenu'),b=$('#jburger');
const set=o=>{menu.classList.toggle('open',o);b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''};
b.onclick=()=>set(true);$('#jclose').onclick=()=>set(false);addEventListener('keydown',e=>e.key==='Escape'&&set(false));
$$('#jmenu a').forEach(a=>a.addEventListener('click',()=>set(false)));
/* paper sheets in hero */
$$('.page-hero').forEach(h=>{h.insertAdjacentHTML('beforeend','<span class="jsheet b"></span><span class="jsheet"></span>')});
/* reveals */
const sel='.fade-up,.card,.price-card,.case-card,.faq-item,.review-card,section>h2,.section-label';
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=[...e.target.parentElement.children].indexOf(e.target);setTimeout(()=>e.target.classList.add('in'),Math.min(i,6)*70);io.unobserve(e.target)}}),{threshold:.12});
$$(sel).forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.9){el.classList.add('jr');io.observe(el)}});
/* hero pointer parallax on sheets */
const sheets=$$('.jsheet');
addEventListener('pointermove',e=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;sheets.forEach((s,i)=>s.style.marginRight=`${(i?-1:1)*x*28}px`)},{passive:true});
