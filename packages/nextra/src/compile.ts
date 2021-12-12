import { compile, CompileOptions } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import { remarkMdxCodeMeta } from 'remark-mdx-code-meta'
import { remarkStaticImage } from './static-image'
import getHeaders from './get-headers'
import { Heading } from 'mdast'

export async function compileMdx(
  source: string,
  mdxOptions: CompileOptions = {},
  nextraOptions: { unstable_staticImage: boolean } = {
    unstable_staticImage: false
  }
) {
  let headers: Heading[] = []
  let titleText: string | null = null
  const result = await compile(source, {
    jsx: true,
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [
      ...(mdxOptions.remarkPlugins || []),
      remarkGfm,
      remarkMdxCodeMeta,
      getHeaders(headers),
      ...(nextraOptions.unstable_staticImage ? [remarkStaticImage] : [])
    ].filter(Boolean)
  })
  if (Array.isArray(headers) && headers.length > 0) {
    const h1 = headers.find(v => v.depth === 1)
    if (h1 && Array.isArray(h1.children)) {
      const child = h1.children[0]
      if (child.type === 'text') {
        titleText = child.value
      }
    }
  }
  return {
    result: String(result),
    titleText
  }
}
