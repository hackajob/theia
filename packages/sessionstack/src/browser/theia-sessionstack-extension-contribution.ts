/********************************************************************************
 * Copyright (C) 2020 hackajob.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable } from 'inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';

@injectable()
export class TheiaSessionstackExtensionContribution implements FrontendApplicationContribution {
    onStart(): void {
        console.log('Initializing the session stack component for recording in iframe.');
        const s = document.createElement('script');
        s.type = 'text/javascript';
        const code = '    !function(a,b){var c=window;c.SessionStack=a,c[a]=c[a]||function(){\n' +
            '    c[a].q=c[a].q||[],c[a].q.push(arguments)},c[a].t=b;var d=document.createElement("script");\n' +
            '    d.async=1,d.src="https://cdn.sessionstack.com/sessionstack.js";\n' +
            '    var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(d,e);\n' +
            '    }("sessionstack", {"token": "5002576f5d264ffa99dec30df4bb553d", "isIframe": true});\n';
        try {
            s.appendChild(document.createTextNode(code));
            document.head.appendChild(s);
        } catch (e) {
            s.text = code;
            document.head.appendChild(s);
        }
    }
}
