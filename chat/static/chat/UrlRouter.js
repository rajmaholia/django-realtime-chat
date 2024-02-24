
class UrlRouter {

    static routes() {
        // Use an array of objects with 'pattern' and 'handler'
        return [
            { pattern: /^\/direct\/(\d+)\/$/, handler: UrlRouter.handleDirect },
            { pattern: /^\/group\/(\S+)\/$/, handler: UrlRouter.handleGroup }
        ];
    }

    static route(url) {
        for (const route of this.routes()) {
            let match = url.match(route.pattern);
            if (match) {
                route.handler(match);
                break;  // Break after the first match
            }
        }
    }

    static visit(url) {
        window.history.pushState(null, null, url);
        // Trigger route handling for the new URL
        this.route(url);
    }

    static listen() {
        window.addEventListener('popstate', function (e) {
            console.log(e)
            // Use the current URL when the popstate event occurs
            const currentUrl = UrlRouter.currentUrl();
            UrlRouter.route(currentUrl);
        });
    }

    // Handlers for specific routes
    static handleDirect(match) {
        ChatArea.load({type:'user',id:match[1]});
    }

    static handleGroup(match) {
        ChatArea.load({type:'group',id:match[1]});
    }
}
