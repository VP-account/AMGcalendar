// Утиліти для стилів
export const baseStyles = {
    // Контейнери
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, var(--color-background), var(--color-surface))'
    } as const,

    // Навігація
    nav: {
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky' as const,
        top: 0,
        zIndex: 10
    } as const,

    navContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-md) 0'
    } as const,

    // Кнопки
    buttonPrimary: {
        padding: 'var(--space-sm) var(--space-lg)',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-on-primary)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500
    } as const,

    buttonSecondary: {
        padding: 'var(--space-sm) var(--space-lg)',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '2px solid var(--color-primary)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 500
    } as const,

    buttonText: {
        padding: 'var(--space-sm) var(--space-md)',
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem'
    } as const,

    // Картки
    card: {
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border-light)'
    } as const,

    cardHover: {
        cursor: 'pointer',
        transition: 'all 0.2s'
    } as const,

    // Заголовки
    h1: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    } as const,

    h2: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    } as const,

    h3: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'var(--color-text-primary)'
    } as const,

    // Текст
    textLarge: {
        fontSize: '1.25rem',
        color: 'var(--color-text-secondary)'
    } as const,

    textNormal: {
        fontSize: '1rem',
        color: 'var(--color-text-secondary)'
    } as const,

    textSmall: {
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)'
    } as const,

    // Утиліти
    flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    } as const,

    flexBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    } as const,

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-lg)'
    } as const
};

// Функція для комбінування стилів
export const combineStyles = (...styles: any[]) => {
    return Object.assign({}, ...styles);
};