/**
 *
 * 创建人  liangsong
 * 创建时间 2023/02/27 11:09
 */

export class DurationRecord
{
    readonly flag: string;
    time: number;

    public constructor(flag: string, time: number)
    {
        this.flag = flag;
        this.time = time;
    }

}

export class CountTimer
{
    private name: string;
    private list: DurationRecord[] = [];
    private countMap: { [key: string]: DurationRecord } = {};
    private total: number;

    public constructor(name: string)
    {
        this.name = name;
        this.addCount(name);
    }

    public addCount(flag: string): void
    {
        this.list.push(new DurationRecord(flag, new Date().getTime()));
    }

    public count(flag: string, cost: number)
    {

        let durationRecord: DurationRecord = this.countMap[flag];
        if (!durationRecord)
        {
            durationRecord = new DurationRecord(flag, cost);
            this.countMap[flag] = durationRecord;
        } else
        {
            durationRecord.time += cost;
        }

    }

    public print(): void
    {
        let sb: string = "";
        this.total = 0;
        let len = this.list.length;
        if (len > 0)
        {
            for (let i = 1; i < len; i++)
            {
                let prev: DurationRecord = this.list[i - 1];
                let curr: DurationRecord = this.list[i];
                let inter = curr.time - prev.time;
                this.total += inter;
                sb += prev.flag.padEnd(30, " ");
                sb += "->";
                sb += curr.flag.padEnd(30, " ");
                sb += "cost ms:" + inter + "\n";
            }
            sb = "========={}===========\n".replace("{}", this.name) + sb;
            sb += "->".padStart(32, " ") + "total cost ms:".padStart(39, "=") + this.total;
            console.log(sb);

        } else
        {
            for (const countMapKey in this.countMap)
            {
                let value = this.countMap[countMapKey];
                sb += countMapKey.padEnd(30, " ");
                sb += "cost ms:" + value.time + "\n";
            }
            sb = "========={}===========\n".replace("{}", this.name) + sb;
            sb += "->".padStart(32, " ") + "total cost ms:".padStart(39, "=") + this.total;
            console.log(sb);
        }


    }

    public reset(): void
    {
        this.list.length = 0;
        this.countMap = {};
    }

    public getTotal(): number
    {
        return this.total;
    }


}
