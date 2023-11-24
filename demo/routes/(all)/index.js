// Match all routes
export const pattern = '/*';

// After all other routes
export const order = 999;

// Add policy to allow `data:` URIs in the stylesheet
export const get = (_request, response) => {
  if (response?.headers?.get('content-type')?.includes('text/html')) {
    response.headers.append('x-img-src', 'data:');
  }
  return response;
};
