const JSDELIVR_PREFIX = 'https://cdn.jsdelivr.net/npm/'
const SKYPACK_PREFIX = 'https://cdn.skypack.dev/'

export function importUrl<T = any>(url: string, sandbox?: boolean): Promise<T> {
  if (sandbox) {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = 'about:blank'
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
    document.body.parentElement!.append(iframe)
    return (iframe.contentWindow as any).eval(`import(${JSON.stringify(url)})`)
  }
  return import(/* @vite-ignore */ url)
}

export function importJsdelivr<T = any>(
  pkg: string,
  path = '/+esm',
): Promise<T> {
  return importUrl(`${JSDELIVR_PREFIX}${pkg}${path || ''}`)
}

export function importSkypack<T = any>(pkg: string): Promise<T> {
  return importUrl(`${SKYPACK_PREFIX}${pkg}?min`)
}

export async function fetchVersion(pkg: string) {
  const raw: { version: string } = await fetch(
    `${JSDELIVR_PREFIX}${pkg}/package.json`,
  ).then(res => res.json())
  return raw.version
}
