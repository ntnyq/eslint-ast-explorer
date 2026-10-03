import { validateParserVersion } from './parser-version'

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
  version: string,
): Promise<T> {
  return importUrl(`${parserPackageUrl(pkg, version)}/+esm`)
}

export function importSkypack<T = any>(pkg: string): Promise<T> {
  return importUrl(`${SKYPACK_PREFIX}${pkg}?min`)
}

function parserPackageUrl(pkg: string, version: string) {
  const validated = validateParserVersion(version)
  if (validated.error || !validated.value) {
    throw new Error(validated.error || 'A parser package version is required')
  }
  // The version is always one URL component; it cannot change the selected package.
  return `${JSDELIVR_PREFIX}${pkg}@${encodeURIComponent(validated.value)}`
}

export async function fetchVersion(pkg: string, version: string) {
  const raw: { version: string } = await fetch(
    `${parserPackageUrl(pkg, version)}/package.json`,
  ).then(res => res.json())
  return raw.version
}
