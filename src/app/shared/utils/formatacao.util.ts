export function getIconeCategoria(nome: string): string {
  switch (nome) {
    case 'Alimentacao':
      return '🍔';
    case 'Transporte':
      return '🚗';
    case 'Lazer':
      return '🎉';
    case 'Saude':
      return '💊';
    case 'Casa':
      return '🏠';
    case 'Educacao':
      return '🎓';
    case 'Streaming':
      return '📺';
    default:
      return '📦';
  }
}
