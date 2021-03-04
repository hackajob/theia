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
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser';
import { MaybePromise } from '@theia/core/lib/common/types';
import { Widget } from '@theia/core/lib/browser/widgets';

@injectable()
export class TheiaWidgetRemoverExtensionContribution implements FrontendApplicationContribution {
    /**
     * Called after the application shell has been attached in case there is no previous workbench layout state.
     * Should return a promise if it runs asynchronously.
     */
    onDidInitializeLayout(app: FrontendApplication): MaybePromise<void> {
        // Remove unused widgets
        app.shell.widgets.forEach((widget: Widget) => {
            if (['scm-view-container', 'scm-view'].includes(widget.id)) {
                widget.dispose();
            }
        });
    }
}
