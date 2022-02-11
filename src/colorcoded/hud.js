import { ClickDetector } from "core/click_detector";
import { makeDiv } from "core/utils";
import { enumColorToShortcode } from "game/colors";
import { BaseHUDPart } from "game/hud/base_hud_part";
import { DynamicDomAttach } from "game/hud/dynamic_dom_attach";
import { COLOR_ITEM_SINGLETONS } from "game/items/color_item";

export class HUDColorSelector extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_ColorSelector");

        for (const item of Object.values(COLOR_ITEM_SINGLETONS)) {
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext("2d");
            item.drawFullSizeOnCanvas(context, 64);
            this.element.appendChild(canvas);

            const detector = new ClickDetector(canvas, {});
            detector.click.add(this.repaintSelection.bind(this, item));
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            attachClass: "visible",
            timeToKeepSeconds: 0.3
        });
    }

    repaintSelection(item) {
        /** @type {import("game/hud/parts/mass_selector").HUDMassSelector} */
        const selector = this.root.hud.parts.massSelector;

        for (const uid of selector.selectedUids) {
            const entity = this.root.entityMgr.findByUid(uid);
            if (entity.components.ColorCoded) {
                entity.components.ColorCoded.color =
                    enumColorToShortcode[item.color];
            }
        }
    }

    update() {
        const selector = this.root.hud.parts.massSelector;
        this.domAttach.update(selector.selectedUids.size > 0);
    }
}