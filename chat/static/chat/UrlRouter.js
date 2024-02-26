
class UrlRouter {
    
    static currentUrl(){
        return window.location.pathname;
    }

    static routes() {
        // Use an array of objects with 'pattern' and 'handler'
        return [
            { pattern: /^\/group\/(\S+)\/detail\/$/, handler: function(){}},
            { pattern: /^\/group\/(\S+)\/edit\/$/, handler: function(){}},
            { pattern: /^\/direct\/(\d+)\/$/, handler: UrlRouter.handleDirect },
            { pattern: /^\/group\/(\S+)\/$/, handler: UrlRouter.handleGroup },
            { pattern: /^\//,  handler: UrlRouter.handleHome},
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
        console.log('HELLO Bachho')
        ChatArea.load({type:'group',id:match[1]});
    }

    static handleHome(match) {
        Home.load();
    }
}
