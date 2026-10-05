using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Nexus.Api.Helpers;

/// <summary>Generates URL-safe slugs (matching the style used in the seed data).</summary>
public static partial class SlugHelper
{
    [GeneratedRegex(@"[^a-z0-9\s-]")] private static partial Regex InvalidChars();
    [GeneratedRegex(@"[\s-]+")]       private static partial Regex Separators();

    public static string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        // Strip diacritics, then lowercase.
        var normalized = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var ch in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        }

        var slug = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        slug = slug.Replace("&", " and ");
        slug = InvalidChars().Replace(slug, string.Empty);
        slug = Separators().Replace(slug, "-").Trim('-');

        return slug.Length > 220 ? slug[..220].Trim('-') : slug;
    }
}
