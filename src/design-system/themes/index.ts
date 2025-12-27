const themeModules = import.meta.glob<string>("./*.css", {
    query: "?inline",
    import: "default",
    eager: true,
});

const themeNames = Object.keys(themeModules)
    .map((path) => path.split("/").pop()?.replace(".css", ""))
    .filter((name): name is string => Boolean(name));

export const themeStyles = Object.values(themeModules) as string[];

export function getAvailableThemes(): string[] {
    return [...themeNames];
}