import { Constants } from './../constants';
import { MessageService } from './../services/message.service';

export abstract class BaseModel {
    protected abstract messageService: MessageService;

    init() {
        const PROP_TYPES = ['number', 'object'];
        const PROP_PREFIX = '_';
        let that = this;

        Object.keys(that)
            .filter(name => {
                const type = typeof(that[name]);
                return PROP_TYPES.map(t => t == type).reduce((x, y) => x || y, false);
            })
            .forEach(name => {
                that[PROP_PREFIX + name] = that[name];
                Object.defineProperty(that, name, {
                    get: () => {
                        return that[PROP_PREFIX + name];
                    },
                    set: (value) => {
                        const oldValue = that[PROP_PREFIX + name];
                        that[PROP_PREFIX + name] = value;
                        that.messageService.send({
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
