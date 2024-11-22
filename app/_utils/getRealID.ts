export const getSimpleIdFromLongId = ({id, type, isReversed = false}: { id: string, type: 'variant' | 'product', isReversed?: boolean }) => {
    const prefixMap = {
      product: 'gid://shopify/Product/',
      variant: 'gid://shopify/ProductVariant/'
    };
    if (isReversed) {
      return `${prefixMap[type]}${id}`;
    }
    const prefix = prefixMap[type];
    return id.startsWith(prefix) ? id.replace(prefix, '') : null;
  };
  