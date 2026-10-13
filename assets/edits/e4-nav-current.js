/* Edit 4: the nav link for the page you are on goes gold. */
(function () {
  var st = document.createElement('style');
  st.textContent = 'nav .nav-links a[aria-current="page"],.mobile-menu a[aria-current="page"]{color:#ffd36b!important}nav .nav-links a[aria-current="page"]::after{width:100%;background:#ffd36b!important}';
  document.head.appendChild(st);
  var here = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '/');
  document.querySelectorAll('nav .nav-links a, .mobile-menu a').forEach(function (a) {
    var u = new URL(a.getAttribute('href'), location.href);
    if (u.origin === location.origin && !u.hash && u.pathname.replace(/\/?$/, '/') === here && here !== '/') a.setAttribute('aria-current', 'page');
  });
})();
