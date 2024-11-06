import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {useActiveSat} from "@/app/lib/context/active-sat-content";

export default function Controller() {
  const {setActiveSatIndex, activeSatIndex} = useActiveSat();
  const [inputValue, setInputValue] = useState('');

  const handleActivate = () => {
    const index = parseInt(inputValue, 10);
    if (!isNaN(index)) {
      setActiveSatIndex(index);
    }
  };

  const handleReset = () => {
    setActiveSatIndex(undefined);
  }

  return (
    <Card className={'fixed left-5 bottom-5 z-10'}>
      <CardHeader>
        <CardTitle>Controller</CardTitle>
      </CardHeader>
      <CardContent className={'space-y-2'}>
        <p>Activate Satellite</p>
        <h1 className={'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl'}>{activeSatIndex}</h1>
        <Input
          placeholder={'Satellite Index'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <div className={'space-x-2'}>
          <Button type="button" onClick={handleActivate}>Activate</Button>
          <Button type={'button'} onClick={handleReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
