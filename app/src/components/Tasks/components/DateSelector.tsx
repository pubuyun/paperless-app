import * as React from 'react';
import Box from '@mui/joy/Box';
import { format, addDays, subDays } from 'date-fns';
import Typography from '@mui/joy/Typography';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';

interface DateSelectorProps {
    DateSelected: number;
    setDateSelected: (date: number) => void;
}

function DateSelector(props: DateSelectorProps) {
  const { DateSelected, setDateSelected } = props;

  return (
    <Box
    sx={{
      flexGrow: 1,
      m: -3,
      p: 4,
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px', 
    }}
    >
      <Tabs
        size="lg"
        value={DateSelected}
        onChange={(event, value) => setDateSelected(value as number)}
        sx={{
          p: 1,
          borderRadius: 16,
          maxWidth: 400,
          mx: 'auto',
          backgroundColor: 'transparent',
          [`& .${tabClasses.root}`]: {
            py: 1,
            flex: 1,
            transition: '0.3s',
            fontWeight: 'md',
            fontSize: 'md',
            [`&:not(.${tabClasses.selected}):not(:hover)`]: {
              opacity: 0.7,
            },
          },
        }}
      >
        <TabList
          variant="plain"
          size="sm"
          disableUnderline
          sx={{ borderRadius: 'lg', p: 0, gap: 1 }}
        >
          {[-1, 0, 1, 2, 3].map((offset) => {
            const date = offset < 0 ? subDays(new Date(), Math.abs(offset)) : addDays(new Date(), offset);
            return (
              <Tab
                key={offset}
                disableIndicator
                orientation="vertical"
                value={offset}
                color={DateSelected === offset ? 'primary' : 'neutral'}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Typography fontSize="1.5rem" fontWeight="bold">
                  {format(date, 'd')}
                </Typography>
                <Typography
                  fontSize="0.8rem"
                  sx={{
                    color: 'grey',
                  }}
                >
                  {format(date, 'EEE')}
                </Typography>
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Box>
  );
}

export default DateSelector;
