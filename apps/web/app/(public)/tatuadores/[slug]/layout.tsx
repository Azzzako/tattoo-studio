export function generateStaticParams() {
  return [{ slug: 'inka' }, { slug: 'mara' }, { slug: 'yael' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
