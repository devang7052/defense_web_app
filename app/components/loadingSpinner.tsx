
export default function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
    const sizeClass = {
      small: 'w-4 h-4 border-2',
      medium: 'w-8 h-8 border-3',
      large: 'w-12 h-12 border-4'
    }[size];
  
    return (
      <div className={`${sizeClass} rounded-full animate-spin border-t-transparent border-blue-600`} />
    );
  }