import type {DinoHandle} from 'dinossr';

export const pattern = '/';

const themes = ['light', 'dark'];

export const POST: DinoHandle = async ({request, platform}) => {
  try {
    const data = await request.json();
    if (!themes.includes(data.theme)) {
      throw new Error();
    }
    platform.cookies.set('theme', {
      name: 'theme',
      value: data.theme,
      path: '/',
      maxAge: 2630000,
      sameSite: 'Strict',
      secure: true
    });
    return Response.json({success: true});
  } catch {
    return new Response(null, {status: 400});
  }
};
