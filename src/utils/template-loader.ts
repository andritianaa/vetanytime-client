import fs from 'fs';
import path from 'path';

// Template type definition
type EmailTemplate = 'reset-password' | 'welcome' | 'verify-email';

// Cache for loaded templates
const templateCache: Record<string, string> = {};

/**
 * Load an email template from the filesystem
 * 
 * @param templateName The name of the template to load
 * @returns The template content as a string
 */
export function loadEmailTemplate(templateName: EmailTemplate): string {
    // Check if template is already cached
    if (templateCache[templateName]) {
        return templateCache[templateName];
    }

    try {
        // Determine template path
        const templatePath = path.join(
            process.cwd(),
            'src',
            'emails',
            'templates',
            `${templateName}.html`
        );

        // Load template from file
        const template = fs.readFileSync(templatePath, 'utf8');

        // Cache the template
        templateCache[templateName] = template;

        return template;
    } catch (error) {
        console.error(`Error loading email template '${templateName}':`, error);

        // Return a simple fallback template in case of error
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{subject}}</title>
      </head>
      <body>
        <p>{{content}}</p>
      </body>
      </html>
    `;
    }
}

/**
 * Replace template variables with their values
 * 
 * @param template The template string with variables in {{variable}} format
 * @param variables Object containing variable names and their values
 * @returns The template with variables replaced
 */
export function replaceTemplateVariables(
    template: string,
    variables: Record<string, string>
): string {
    let result = template;

    // Replace each variable in the template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
}

/**
 * Combine a template with component parts
 * Note: This is a simplified implementation and doesn't support full handlebars/mustache syntax
 * 
 * @param template The main template
 * @param components Object containing component names and their content
 * @returns The composed template
 */
export function composeTemplate(
    template: string,
    components: Record<string, string>
): string {
    let result = template;

    // Replace each component in the template
    for (const [key, value] of Object.entries(components)) {
        const regex = new RegExp(`{{> ${key}}}`, 'g');
        result = result.replace(regex, value);
    }

    return result;
}

/**
 * Load a component from the filesystem
 * 
 * @param componentName The name of the component to load
 * @returns The component content as a string
 */
export function loadEmailComponent(componentName: string): string {
    try {
        const componentPath = path.join(
            process.cwd(),
            'src',
            'emails',
            'components',
            `${componentName}.html`
        );

        return fs.readFileSync(componentPath, 'utf8');
    } catch (error) {
        console.error(`Error loading email component '${componentName}':`, error);
        return '';
    }
}

/**
 * Generate a plain text version of an HTML email
 * This is a very simplified conversion - for production use consider using a library
 * 
 * @param html HTML content
 * @returns Plain text version
 */
export function generatePlainTextVersion(html: string): string {
    // This is a very simplified conversion - for production use a dedicated library
    let text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // Remove style tags
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]+>/g, '')                          // Remove HTML tags
        .replace(/&nbsp;/g, ' ')                          // Replace non-breaking spaces
        .replace(/\s+/g, ' ')                             // Normalize whitespace
        .trim();                                          // Trim leading/trailing whitespace

    // Decode HTML entities
    text = text.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    return text;
}