import {Database} from "$lib/server/db/database";

declare type AuditActor = 'System' | string;
declare type AuditTarget = AuditActor;
declare type AuditEvent = 'System' | 'Maintenance' | 'Moderation' | 'Creation' | 'Modification' | 'Removal';

export interface AuditRecord {
    id: number,
    actor: AuditActor,
    target: AuditTarget,
    event: AuditEvent,
    message: string,
    timestamp: string | number | Date
}

export class Audit {
    static async new(actor: AuditActor, target: AuditTarget, event: AuditEvent, message: string): Promise<void> {
        await Database.SQL`INSERT INTO audit(actor, target, event, message)
                           VALUES (${actor}, ${target}, ${event}, ${message})`;
    }

    static async system(target: AuditTarget, event: AuditEvent, message: string): Promise<void> {
        await this.new('System', target, event, message);
    }

    static async user(actor: string, target: AuditTarget, event: AuditEvent, message: string): Promise<void> {
        await this.new(actor, target, event, message);
    }
}