import select from 'select-dom';

export const isZapNameSet = (): boolean => {
  const heading = select('h1.generic-heading');
  if (heading === null) return false;
  const zapName = heading?.textContent;
  return zapName !== null && zapName!.length > 0 && zapName !== 'Name your zap';
}
