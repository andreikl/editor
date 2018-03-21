import { Constants } from './../constants';
import { MessageService } from './../services/message.service';

export abstract class BaseModel {
    protected abstract messageService: MessageService;

    init() {
        const PROP_PREFIX = '_';

        this['properties'].forEach(name => {
                this[PROP_PREFIX + name] = this[name];
                Object.defineProperty(this, name, {
                    get: () => {
                        return this[PROP_PREFIX + name];
                    },
                    set: (value) => {
                        const oldValue = this[PROP_PREFIX + name];
                        this[PROP_PREFIX + name] = value;
                        this.messageService.send({
                            name: Constants.EVENT_MODEL_CHANGED,
                            data: {
                                name: name,
                                value: value,
                                oldValue: oldValue
                            }
                        });
                    }
                });
            });
    }
}
