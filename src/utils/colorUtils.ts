const generateRandomColorPair = () => {
    const colorPairs = [
        {
            dark: '#2b6cb0',
            light: '#bee3f8',
        },
        {
            dark: '#c53030',
            light: '#feb2b2',
        },
        {
            dark: '#38a169',
            light: '#c6f6d5',
        },
        {
            dark: '#6b46c1',
            light: '#e9d8fd',
        },
        {
            dark: '#b7791f',
            light: '#faf089',
        },
        {
            dark: '#2c7a7b',
            light: '#b2f5ea',
        },
        {
            dark: '#9c4221',
            light: '#fbd38d',
        },
        {
            dark: '#44337a',
            light: '#d6bcfa',
        },
        {
            dark: '#744210',
            light: '#ffe29a',
        },
        {
            dark: '#553c9a',
            light: '#f3e8ff',
        },
        {
            dark: '#22543d',
            light: '#e6fffa',
        },
    ];

    const idx = Math.floor(Math.random() * colorPairs.length);
    return colorPairs[idx];
};

export default generateRandomColorPair;
