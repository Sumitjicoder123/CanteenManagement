import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('canteen_token');
  let url = req.url;

  // Automatically point relative API requests to http://localhost:8081 when not served from port 8081 or 4200 proxy
  const isLocalAltPort =
    window.location.protocol === 'file:' ||
    ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.port !== '8081' &&
      window.location.port !== '4200');

  if (isLocalAltPort && url.startsWith('/')) {
    url = `http://localhost:8081${url}`;
  }

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const cloned = req.clone({ url, headers });
  return next(cloned);
};
